import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialization for Gemini API client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI-assisted Table of Contents Generation
app.post("/api/gemini/generate-toc", async (req, res) => {
  try {
    const { pages, fileName } = req.body;
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid pages data" });
    }

    const ai = getGemini();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on server",
        fallback: true,
      });
    }

    // Format the pages excerpts for the prompt (page number + text snippets)
    const formattedPages = pages
      .map((p: { pageNumber: number; text: string; topLines?: string[] }) => {
        const snippet = (p.text || "").slice(0, 1000);
        const topLinesPreview = p.topLines?.slice(0, 5).join(" | ") || "";
        return `[PAGE ${p.pageNumber}]\nTop lines: ${topLinesPreview}\nText: ${snippet}`;
      })
      .join("\n\n---\n\n");

    const prompt = `Analyze this PDF document (${fileName || "Document"}) consisting of ${pages.length} pages.
Extract an organized, accurate Table of Contents (目次).
Identify headings, section breaks, chapter titles, and subheadings with their exact 1-based page numbers.
Assign proper level:
1: Main title / Chapter / Section 1 (第1章, etc.)
2: Subsection / Section 1.1
3: Sub-subsection / Detail section

Page data:
${formattedPages}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert document analyzer that specializes in PDF layout, structure, and Table of Contents (TOC) creation. Analyze page titles, section headers, numbering (e.g., 第1章, 1., 1.1), font prominences, and line breaks to produce a clean, structured Table of Contents in Japanese (or document's original language). Always ensure page numbers are accurate 1-based indices.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTitle: {
              type: Type.STRING,
              description: "Overall inferred document title",
            },
            summary: {
              type: Type.STRING,
              description: "Brief 1-2 sentence overview of document",
            },
            items: {
              type: Type.ARRAY,
              description: "Structured table of contents entries",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Section or heading title",
                  },
                  pageNumber: {
                    type: Type.INTEGER,
                    description: "1-based starting page number",
                  },
                  level: {
                    type: Type.INTEGER,
                    description: "Heading level (1 = main chapter, 2 = section, 3 = subsection)",
                  },
                  snippet: {
                    type: Type.STRING,
                    description: "Brief summary or key phrase from this section",
                  },
                },
                required: ["title", "pageNumber", "level"],
              },
            },
          },
          required: ["documentTitle", "items"],
        },
      },
    });

    const rawText = response.text?.trim() || "{}";
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Gemini TOC generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate TOC with AI",
      fallback: true,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
