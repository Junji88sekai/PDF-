import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SampleDocConfig {
  id: string;
  name: string;
  description: string;
  pageCount: number;
}

export const SAMPLE_DOCS: SampleDocConfig[] = [
  {
    id: 'ai-whitepaper',
    name: 'AI_Architecture_Whitepaper.pdf',
    description: '次世代AIシステム設計白書（全8ページ、章節構造・仕様）',
    pageCount: 8,
  },
  {
    id: 'security-manual',
    name: 'Security_Policy_Manual.pdf',
    description: '情報セキュリティ基本規程（全6ページ、規約・認証要件）',
    pageCount: 6,
  },
];

export async function generateSamplePdf(docId: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (docId === 'security-manual') {
    return generateSecurityManual(pdfDoc, fontRegular, fontBold);
  } else {
    return generateAiWhitepaper(pdfDoc, fontRegular, fontBold);
  }
}

async function generateAiWhitepaper(
  pdfDoc: PDFDocument,
  regular: any,
  bold: any
): Promise<Uint8Array> {
  const pagesData = [
    {
      page: 1,
      isCover: true,
      title: 'NEXT-GENERATION AI ARCHITECTURE',
      subtitle: 'Technical Whitepaper 2026 - Enterprise Systems Engineering',
      author: 'Deep Architecture Lab & Platform Engineering',
      date: 'September 2026 / Version 2.4',
      abstract:
        'This whitepaper establishes the foundational architectural specifications for high-throughput, low-latency multimodal AI systems. We detail end-to-end data pipelines, streaming neural inference, vector retrieval topologies, and rigorous enterprise security boundaries.',
    },
    {
      page: 2,
      chapter: 'CHAPTER 1',
      title: '1. Introduction & Executive Summary',
      sections: [
        {
          heading: '1.1 System Motivation & Objectives',
          body: 'Modern enterprise workloads demand continuous reasoning capabilities across heterogeneous input streams. Traditional batch-oriented processing fails to meet the latency bounds required for real-time human-computer collaboration.',
        },
        {
          heading: '1.2 Core Architectural Principles',
          body: '1. Zero-trust by default across all neural endpoints.\n2. Sub-50ms token generation latency on edge ingress.\n3. Dynamic hybrid retrieval combining sparse BM25 and dense vector indexing.\n4. Strict memory boundaries with verifiable audit telemetry.',
        },
      ],
    },
    {
      page: 3,
      chapter: 'CHAPTER 2',
      title: '2. Multimodal Ingestion Pipeline',
      sections: [
        {
          heading: '2.1 Streaming Media Ingestion',
          body: 'The ingestion layer receives continuous WebRTC audio packets, discrete video keyframes, and document buffers. Binary streams are normalized at the edge gateway before routing to quantized representation engines.',
        },
        {
          heading: '2.2 Document Layout & Structural Parsing',
          body: 'For document extraction, our layout recognition models detect semantic reading orders, table hierarchies, typography weights, and structural page breaks. This enables deterministic table of contents generation and instant keyword localization.',
        },
      ],
    },
    {
      page: 4,
      chapter: 'CHAPTER 2 (Continued)',
      title: '2.3 Real-Time Reasoning & Latency Budgets',
      sections: [
        {
          heading: '2.3.1 Speculative Decoding Acceleration',
          body: 'To minimize time-to-first-token, draft verification models predict upcoming token sequences in parallel. Verified output achieves a 2.4x speedup over autoregressive baselines without degradation in semantic fidelity.',
        },
        {
          heading: '2.3.2 Memory-Efficient KV-Cache Compression',
          body: 'Dynamic KV-cache eviction preserves context integrity while truncating non-critical semantic intermediate tokens, capping memory utilization under sustained high-concurrency loads.',
        },
      ],
    },
    {
      page: 5,
      chapter: 'CHAPTER 3',
      title: '3. Vector Search & Hybrid Retrieval',
      sections: [
        {
          heading: '3.1 Distributed Index Topology',
          body: 'The retrieval cluster partitions embeddings across sharded HNSW graphs. Approximate nearest neighbor queries execute concurrently with inverted-index keyword searches to maximize recall precision across technical jargon.',
        },
        {
          heading: '3.2 Reranking & Cross-Attention Verification',
          body: 'Top-50 candidate passages undergo neural cross-encoder reranking. Context relevance scoring filters hallucinations before synthesizing final output summaries.',
        },
      ],
    },
    {
      page: 6,
      chapter: 'CHAPTER 3 (Continued)',
      title: '3.3 Context Window Management & Chunking',
      sections: [
        {
          heading: '3.3.1 Semantic Boundary Chunking',
          body: 'Rather than arbitrary fixed-length slicing, documents are parsed by structural headers, markdown sections, and paragraph semantics. This ensures search results jump directly to coherent logical sections.',
        },
        {
          heading: '3.3.2 Fast In-Memory Full-Text Indexing',
          body: 'Full-text token indices are held in local worker memory, allowing instant prefix and exact-word matching with zero network round-trip overhead.',
        },
      ],
    },
    {
      page: 7,
      chapter: 'CHAPTER 4',
      title: '4. Enterprise Security & Access Control',
      sections: [
        {
          heading: '4.1 Role-Based Access Control (RBAC)',
          body: 'Every query token inherits user role claims. Vector query execution performs pre-filtering against document classification labels to strictly isolate multi-tenant data stores.',
        },
        {
          heading: '4.2 Encryption at Rest and in Transit',
          body: 'All document caches and vector records are encrypted using AES-GCM-256 with customer-managed keys. Ephemeral worker sandboxes undergo memory purging immediately upon session termination.',
        },
      ],
    },
    {
      page: 8,
      chapter: 'CHAPTER 5',
      title: '5. Conclusion & Deployment Roadmap',
      sections: [
        {
          heading: '5.1 Summary of Evaluated Benchmarks',
          body: 'Experimental validation across 10,000 synthetic technical documents confirmed a 99.4% Table of Contents extraction accuracy and sub-10ms search retrieval latency.',
        },
        {
          heading: '5.2 Future Horizons & Autonomous Workflows',
          body: 'Upcoming milestones focus on proactive TOC restructuring based on reader engagement metrics and automated semantic cross-referencing between related corporate repositories.',
        },
      ],
    },
  ];

  for (const item of pagesData) {
    const page = pdfDoc.addPage([595, 842]); // A4 dimensions
    const { width, height } = page.getSize();

    // Top subtle header line
    page.drawLine({
      start: { x: 50, y: height - 40 },
      end: { x: width - 50, y: height - 40 },
      thickness: 0.8,
      color: rgb(0.8, 0.82, 0.85),
    });

    page.drawText('AI ARCHITECTURE WHITEPAPER - CONFIDENTIAL', {
      x: 50,
      y: height - 34,
      size: 8,
      font: regular,
      color: rgb(0.5, 0.55, 0.6),
    });

    page.drawText(`Page ${item.page}`, {
      x: width - 85,
      y: height - 34,
      size: 8,
      font: regular,
      color: rgb(0.5, 0.55, 0.6),
    });

    if (item.isCover) {
      // Cover page styling
      page.drawRectangle({
        x: 50,
        y: height - 260,
        width: width - 100,
        height: 180,
        color: rgb(0.08, 0.12, 0.22),
      });

      page.drawText('TECHNICAL REPORT SERIES', {
        x: 75,
        y: height - 120,
        size: 11,
        font: bold,
        color: rgb(0.4, 0.7, 1.0),
      });

      page.drawText('NEXT-GENERATION AI ARCHITECTURE', {
        x: 75,
        y: height - 155,
        size: 18,
        font: bold,
        color: rgb(1, 1, 1),
      });

      page.drawText(item.subtitle || '', {
        x: 75,
        y: height - 190,
        size: 11,
        font: regular,
        color: rgb(0.85, 0.88, 0.95),
      });

      page.drawText(item.date || '', {
        x: 75,
        y: height - 230,
        size: 9,
        font: regular,
        color: rgb(0.65, 0.75, 0.85),
      });

      // Abstract box
      page.drawText('EXECUTIVE ABSTRACT', {
        x: 50,
        y: height - 310,
        size: 12,
        font: bold,
        color: rgb(0.15, 0.2, 0.3),
      });

      page.drawText(
        'This whitepaper establishes the foundational architectural specifications for\nhigh-throughput, low-latency multimodal AI systems. We detail end-to-end data\npipelines, streaming neural inference, vector retrieval topologies, and\nrigorous enterprise security boundaries.',
        {
          x: 50,
          y: height - 340,
          size: 10,
          lineHeight: 16,
          font: regular,
          color: rgb(0.25, 0.3, 0.35),
        }
      );

      page.drawText('PRIMARY TOPICS COVERED IN THIS DOCUMENT:', {
        x: 50,
        y: height - 440,
        size: 10,
        font: bold,
        color: rgb(0.15, 0.2, 0.3),
      });

      const tocPreview = [
        '1. Introduction & Executive Summary ................................................. Page 2',
        '2. Multimodal Ingestion Pipeline .................................................... Page 3',
        '   2.3 Real-Time Reasoning & Latency Budgets ................................. Page 4',
        '3. Vector Search & Hybrid Retrieval ................................................. Page 5',
        '   3.3 Context Window Management & Chunking .................................. Page 6',
        '4. Enterprise Security & Access Control ............................................ Page 7',
        '5. Conclusion & Deployment Roadmap ................................................. Page 8',
      ];

      let yPos = height - 470;
      for (const line of tocPreview) {
        page.drawText(line, {
          x: 60,
          y: yPos,
          size: 9,
          font: regular,
          color: rgb(0.35, 0.4, 0.45),
        });
        yPos -= 22;
      }
    } else {
      // Chapter and Section styling
      let currentY = height - 80;

      if (item.chapter) {
        page.drawText(item.chapter, {
          x: 50,
          y: currentY,
          size: 10,
          font: bold,
          color: rgb(0.2, 0.45, 0.8),
        });
        currentY -= 24;
      }

      page.drawText(item.title || '', {
        x: 50,
        y: currentY,
        size: 16,
        font: bold,
        color: rgb(0.1, 0.15, 0.25),
      });
      currentY -= 35;

      if (item.sections) {
        for (const sec of item.sections) {
          page.drawText(sec.heading, {
            x: 50,
            y: currentY,
            size: 12,
            font: bold,
            color: rgb(0.18, 0.22, 0.3),
          });
          currentY -= 20;

          // Split multi-line body
          const lines = sec.body.split('\n');
          for (const line of lines) {
            // Basic line wrapping
            const words = line.split(' ');
            let lineBuffer = '';
            for (const word of words) {
              const testLine = lineBuffer ? `${lineBuffer} ${word}` : word;
              if (testLine.length > 70) {
                page.drawText(lineBuffer, {
                  x: 50,
                  y: currentY,
                  size: 9.5,
                  font: regular,
                  color: rgb(0.25, 0.3, 0.35),
                });
                currentY -= 15;
                lineBuffer = word;
              } else {
                lineBuffer = testLine;
              }
            }
            if (lineBuffer) {
              page.drawText(lineBuffer, {
                x: 50,
                y: currentY,
                size: 9.5,
                font: regular,
                color: rgb(0.25, 0.3, 0.35),
              });
              currentY -= 15;
            }
          }
          currentY -= 20;
        }
      }
    }

    // Bottom subtle footer
    page.drawLine({
      start: { x: 50, y: 40 },
      end: { x: width - 50, y: 40 },
      thickness: 0.5,
      color: rgb(0.85, 0.87, 0.9),
    });

    page.drawText('AI Research & Enterprise Engineering Standards', {
      x: 50,
      y: 26,
      size: 8,
      font: regular,
      color: rgb(0.6, 0.65, 0.7),
    });

    page.drawText(`- ${item.page} -`, {
      x: width / 2 - 10,
      y: 26,
      size: 9,
      font: bold,
      color: rgb(0.4, 0.45, 0.5),
    });
  }

  return await pdfDoc.save();
}

async function generateSecurityManual(
  pdfDoc: PDFDocument,
  regular: any,
  bold: any
): Promise<Uint8Array> {
  const pagesData = [
    {
      page: 1,
      title: 'INFORMATION SECURITY POLICY MANUAL',
      sub: 'Global Organization Governance Standards',
      sec1Title: '1. Purpose & Scope',
      sec1Body:
        'This manual defines mandatory information security requirements across all cloud, on-premises, and contractor environments. Adherence is obligatory for all personnel, infrastructure operations, and vendor integrations.',
      sec2Title: '2. Executive Endorsement',
      sec2Body:
        'The Chief Information Security Officer (CISO) and Executive Board enforce these controls to safeguard proprietary intellectual property and customer records.',
    },
    {
      page: 2,
      title: 'Chapter 1: Identity & Access Management',
      sub: 'IAM Controls and Lifecycle Management',
      sec1Title: '1.1 Principle of Least Privilege',
      sec1Body:
        'Access rights must be granted solely on a verifiable business necessity basis. Default permissions across all resources are explicitly configured as Deny-All.',
      sec2Title: '1.2 Privilege Escalation Protocols',
      sec2Body:
        'Temporary administrative access requires just-in-time approval with two-party authorization and automated time-to-live expiration after 60 minutes.',
    },
    {
      page: 3,
      title: 'Chapter 2: Multi-Factor Authentication Requirements',
      sub: 'Strong Credential Standards',
      sec1Title: '2.1 FIDO2 & Hardware Security Keys',
      sec1Body:
        'All corporate accounts accessing production clusters or confidential customer databases must utilize FIDO2-compliant physical hardware tokens. SMS-based OTP verification is strictly prohibited.',
      sec2Title: '2.2 Session Lifetime Restrictions',
      sec2Body:
        'Web administrative sessions terminate automatically following 15 minutes of inactivity or a maximum continuous duration of 8 hours.',
    },
    {
      page: 4,
      title: 'Chapter 3: Cryptographic Controls & Data Classification',
      sub: 'Confidentiality and Integrity Measures',
      sec1Title: '3.1 Data Classification Tiers',
      sec1Body:
        'All corporate data must be tagged according to three distinct tiers: Tier 1 (Public), Tier 2 (Internal Restricted), and Tier 3 (Highly Confidential PII & Secrets).',
      sec2Title: '3.2 Encryption Standards',
      sec2Body:
        'Data at rest must employ AES-256 or ChaCha20-Poly1305. Data in transit must utilize TLS 1.3 with forward secrecy cipher suites.',
    },
    {
      page: 5,
      title: 'Chapter 4: Incident Response & Disaster Recovery',
      sub: 'Security Operations & Continuity',
      sec1Title: '4.1 Incident Severity Levels & Triage',
      sec1Body:
        'Sev-1 security events (unauthorized intrusion, data exfiltration) require initial containment response within 15 minutes and escalation to the incident leadership council.',
      sec2Title: '4.2 Forensic Preservation & Audit Logs',
      sec2Body:
        'Immutable audit logs must be replicated to off-site append-only storage and preserved for a statutory minimum of 365 days.',
    },
    {
      page: 6,
      title: 'Chapter 5: Employee Compliance & Sanctions',
      sub: 'Governance and Regular Review',
      sec1Title: '5.1 Annual Security Training',
      sec1Body:
        'All active employees must successfully complete annual cybersecurity assessments and periodic simulated phishing training modules.',
      sec2Title: '5.2 Policy Audit & Amendments',
      sec2Body:
        'This manual undergoes comprehensive review every 12 months or immediately following any significant architectural shift.',
    },
  ];

  for (const item of pagesData) {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    page.drawLine({
      start: { x: 50, y: height - 40 },
      end: { x: width - 50, y: height - 40 },
      thickness: 0.8,
      color: rgb(0.7, 0.75, 0.8),
    });

    page.drawText('INTERNAL COMPLIANCE & GOVERNANCE MANUAL', {
      x: 50,
      y: height - 34,
      size: 8,
      font: bold,
      color: rgb(0.4, 0.45, 0.5),
    });

    page.drawText(`Page ${item.page}`, {
      x: width - 85,
      y: height - 34,
      size: 8,
      font: regular,
      color: rgb(0.4, 0.45, 0.5),
    });

    page.drawText(item.title, {
      x: 50,
      y: height - 90,
      size: 15,
      font: bold,
      color: rgb(0.12, 0.18, 0.28),
    });

    page.drawText(item.sub, {
      x: 50,
      y: height - 110,
      size: 10,
      font: regular,
      color: rgb(0.4, 0.45, 0.55),
    });

    page.drawLine({
      start: { x: 50, y: height - 125 },
      end: { x: width - 50, y: height - 125 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.92),
    });

    // Section 1
    page.drawText(item.sec1Title, {
      x: 50,
      y: height - 160,
      size: 12,
      font: bold,
      color: rgb(0.15, 0.22, 0.35),
    });

    page.drawText(item.sec1Body, {
      x: 50,
      y: height - 185,
      size: 9.5,
      lineHeight: 16,
      font: regular,
      color: rgb(0.25, 0.3, 0.38),
    });

    // Section 2
    page.drawText(item.sec2Title, {
      x: 50,
      y: height - 280,
      size: 12,
      font: bold,
      color: rgb(0.15, 0.22, 0.35),
    });

    page.drawText(item.sec2Body, {
      x: 50,
      y: height - 305,
      size: 9.5,
      lineHeight: 16,
      font: regular,
      color: rgb(0.25, 0.3, 0.38),
    });

    // Footer
    page.drawText(`- ${item.page} -`, {
      x: width / 2 - 10,
      y: 28,
      size: 9,
      font: bold,
      color: rgb(0.45, 0.5, 0.55),
    });
  }

  return await pdfDoc.save();
}
