import { TocItem, SearchMatch, PageTextData } from '../types';

/**
 * Extracts structured text and typography data from each page of a PDF document.
 */
export async function extractDocumentText(pdfDoc: any): Promise<PageTextData[]> {
  const pagesData: PageTextData[] = [];
  const numPages = pdfDoc.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items || [];

    // Group items into lines based on Y coordinate
    const lineMap = new Map<number, { text: string; fontSize: number; isBold: boolean; y: number }[]>();

    for (const item of items) {
      if (!('str' in item) || !item.str.trim()) continue;

      // Transform matrix: [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.round(Math.abs(item.transform?.[0] || item.height || 12));
      const y = Math.round(item.transform?.[5] || 0);
      const fontName = (item.fontName || '').toLowerCase();
      const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');

      // Cluster lines within ~4px Y delta
      let matchedKey = y;
      for (const existingKey of lineMap.keys()) {
        if (Math.abs(existingKey - y) <= 4) {
          matchedKey = existingKey;
          break;
        }
      }

      if (!lineMap.has(matchedKey)) {
        lineMap.set(matchedKey, []);
      }
      lineMap.get(matchedKey)!.push({
        text: item.str,
        fontSize,
        isBold,
        y,
      });
    }

    // Sort lines from top of page to bottom (PDF Y is from bottom to top, so higher Y is higher on page)
    const sortedYKeys = Array.from(lineMap.keys()).sort((a, b) => b - a);

    const fullLines: string[] = [];
    const headings: { text: string; fontSize: number; isBold: boolean; y: number }[] = [];

    for (const y of sortedYKeys) {
      const lineItems = lineMap.get(y)!;
      const lineStr = lineItems.map((i) => i.text).join(' ').trim();
      if (!lineStr) continue;

      fullLines.push(lineStr);

      const maxFontSize = Math.max(...lineItems.map((i) => i.fontSize));
      const anyBold = lineItems.some((i) => i.isBold);

      headings.push({
        text: lineStr,
        fontSize: maxFontSize,
        isBold: anyBold,
        y,
      });
    }

    pagesData.push({
      pageNumber: pageNum,
      text: fullLines.join('\n'),
      lines: fullLines,
      headings,
    });
  }

  return pagesData;
}

/**
 * Extracts native PDF outline bookmarks if embedded in the document.
 */
export async function extractNativeOutline(pdfDoc: any): Promise<TocItem[] | null> {
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) return null;

    const items: TocItem[] = [];

    const processItem = async (node: any, level: number) => {
      let pageNumber = 1;
      try {
        if (typeof node.dest === 'string') {
          const dest = await pdfDoc.getDestination(node.dest);
          if (dest && dest[0]) {
            const pageIndex = await pdfDoc.getPageIndex(dest[0]);
            pageNumber = pageIndex + 1;
          }
        } else if (Array.isArray(node.dest) && node.dest[0]) {
          const pageIndex = await pdfDoc.getPageIndex(node.dest[0]);
          pageNumber = pageIndex + 1;
        }
      } catch {
        // Destination lookup fallback
      }

      items.push({
        id: `outline-${items.length + 1}`,
        title: node.title?.trim() || `Section ${items.length + 1}`,
        pageNumber,
        level: Math.min(Math.max(level, 1), 3),
      });

      if (Array.isArray(node.items) && node.items.length > 0) {
        for (const child of node.items) {
          await processItem(child, level + 1);
        }
      }
    };

    for (const rootNode of outline) {
      await processItem(rootNode, 1);
    }

    return items.length > 0 ? items : null;
  } catch (err) {
    console.warn('Could not extract native outline:', err);
    return null;
  }
}

/**
 * Intelligent local rule-based Table of Contents generator.
 * Analyzes font sizes, heading patterns, line positions, and page transitions.
 */
export function generateHeuristicToc(pagesData: PageTextData[]): TocItem[] {
  const items: TocItem[] = [];

  // Calculate global font size distribution to recognize outliers/headings
  const allFontSizes: number[] = [];
  pagesData.forEach((p) => {
    p.headings.forEach((h) => allFontSizes.push(h.fontSize));
  });

  allFontSizes.sort((a, b) => a - b);
  const medianFontSize = allFontSizes.length > 0 ? allFontSizes[Math.floor(allFontSizes.length / 2)] : 12;

  // Patterns indicating section/chapter titles
  const chapterRegex =
    /^(?:第\s*[0-9０-９一二三四五六七八九十百]+(?:\s*[章節条部項])|chapter\s*[0-9]+|[0-9]+\.[0-9]+(?:\.[0-9]+)?|[0-9]+\s*[\.．\s]|\b(?:はじめに|おわりに|概要|要約|目次|結論|付録|appendix|introduction|executive summary|abstract|conclusion|references)\b)/i;

  const seenTitles = new Set<string>();

  for (const p of pagesData) {
    // Check top 6 lines of each page for major headers
    const candidateLines = p.headings.slice(0, 6);

    for (let idx = 0; idx < candidateLines.length; idx++) {
      const line = candidateLines[idx];
      const text = line.text.trim();

      // Skip very short lines or page numbers or long paragraphs
      if (text.length < 3 || text.length > 90) continue;
      if (/^(?:page|p\.)\s*[0-9]+$/i.test(text)) continue;
      if (/^[0-9]+$/.test(text)) continue;

      const isLargeFont = line.fontSize >= medianFontSize * 1.25;
      const isPatternMatch = chapterRegex.test(text);

      if (isLargeFont || isPatternMatch || (line.isBold && line.fontSize >= medianFontSize)) {
        // Clean title
        const cleanTitle = text.replace(/\s+/g, ' ');
        const normalizedKey = `${p.pageNumber}-${cleanTitle.toLowerCase()}`;

        if (seenTitles.has(normalizedKey)) continue;
        seenTitles.add(normalizedKey);

        // Determine Level
        let level = 1;
        if (/^[0-9]+\.[0-9]+\.[0-9]+/i.test(cleanTitle) || line.fontSize < medianFontSize * 1.15) {
          level = 3;
        } else if (/^[0-9]+\.[0-9]+/i.test(cleanTitle) || (isPatternMatch && /節|項/.test(cleanTitle))) {
          level = 2;
        } else if (line.fontSize >= medianFontSize * 1.4 || /^(?:第\s*[0-9０-９一二三四五六七八九十百]+(?:\s*[章部])|chapter\s*[0-9]+|[0-9]+\s*[\.．])/i.test(cleanTitle)) {
          level = 1;
        }

        items.push({
          id: `toc-${items.length + 1}`,
          title: cleanTitle,
          pageNumber: p.pageNumber,
          level,
          snippet: p.lines.slice(idx + 1, idx + 3).join(' ').slice(0, 120),
        });

        // Avoid adding too many sub-lines from the same page header block
        if (items.length >= 40) break;
      }
    }
  }

  // If no headings found through heuristics, fallback to one entry per page if small doc
  if (items.length === 0) {
    pagesData.forEach((p) => {
      const firstLine = p.lines[0]?.trim() || `ページ ${p.pageNumber}`;
      items.push({
        id: `page-${p.pageNumber}`,
        title: firstLine.length > 50 ? `${firstLine.slice(0, 50)}...` : firstLine,
        pageNumber: p.pageNumber,
        level: 1,
      });
    });
  }

  return items;
}

/**
 * Call server-side Gemini to generate a high-quality semantic Table of Contents
 */
export async function generateAiToc(
  pagesData: PageTextData[],
  fileName: string
): Promise<{ documentTitle?: string; summary?: string; items: TocItem[] }> {
  const payload = {
    fileName,
    pages: pagesData.map((p) => ({
      pageNumber: p.pageNumber,
      text: p.text,
      topLines: p.lines.slice(0, 5),
    })),
  };

  const response = await fetch('/api/gemini/generate-toc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawItems = data.items || [];

  const items: TocItem[] = rawItems.map((item: any, i: number) => ({
    id: `ai-toc-${i + 1}`,
    title: item.title,
    pageNumber: Math.max(1, Math.min(pagesData.length, item.pageNumber || 1)),
    level: Math.min(Math.max(item.level || 1, 1), 3),
    snippet: item.snippet,
    isAiGenerated: true,
  }));

  return {
    documentTitle: data.documentTitle,
    summary: data.summary,
    items,
  };
}

/**
 * Instant full-text search across all pages with context snippet extraction.
 */
export function searchDocumentText(
  pagesData: PageTextData[],
  query: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean } = {}
): SearchMatch[] {
  if (!query || !query.trim()) return [];

  const trimmedQuery = query.trim();
  const flags = options.caseSensitive ? 'g' : 'gi';

  let regex: RegExp;
  try {
    const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = options.wholeWord ? new RegExp(`\\b${escaped}\\b`, flags) : new RegExp(escaped, flags);
  } catch {
    return [];
  }

  const matches: SearchMatch[] = [];
  const contextLength = 36;

  pagesData.forEach((page) => {
    const text = page.text;
    let match: RegExpExecArray | null;

    let matchIdxOnPage = 0;
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchWord = match[0];

      const startSnippet = Math.max(0, matchIndex - contextLength);
      const endSnippet = Math.min(text.length, matchIndex + matchWord.length + contextLength);

      const beforeSnippet = (startSnippet > 0 ? '...' : '') + text.slice(startSnippet, matchIndex);
      const afterSnippet = text.slice(matchIndex + matchWord.length, endSnippet) + (endSnippet < text.length ? '...' : '');

      matches.push({
        id: `match-p${page.pageNumber}-${matchIdxOnPage++}`,
        pageNumber: page.pageNumber,
        matchIndex: matches.length,
        beforeSnippet,
        matchWord,
        afterSnippet,
        fullSnippet: `${beforeSnippet}${matchWord}${afterSnippet}`.replace(/\n+/g, ' '),
        approxIndexInPageText: matchIndex,
      });

      // Avoid infinite loop on zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
  });

  return matches;
}
