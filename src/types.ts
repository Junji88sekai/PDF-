export interface TocItem {
  id: string;
  title: string;
  pageNumber: number; // 1-based
  level: number; // 1: H1/Chapter, 2: H2/Section, 3: H3/Subsection
  snippet?: string;
  isAiGenerated?: boolean;
}

export interface SearchMatch {
  id: string;
  pageNumber: number;
  matchIndex: number;
  beforeSnippet: string;
  matchWord: string;
  afterSnippet: string;
  fullSnippet: string;
  // Approximate position for highlighting if available
  approxIndexInPageText: number;
}

export interface PageTextData {
  pageNumber: number;
  text: string;
  lines: string[];
  headings: {
    text: string;
    fontSize: number;
    isBold: boolean;
    y: number;
  }[];
}

export interface DocumentInfo {
  name: string;
  totalPages: number;
  fileSizeBytes?: number;
  isSample?: boolean;
}

export type SidebarTab = 'toc' | 'search' | 'pages';
export type ViewMode = 'continuous' | 'single';
export type ZoomMode = 'fit-width' | 'fit-page' | 'custom';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export type PageNumberFormat =
  | 'number-only' // 1
  | 'hyphens' // - 1 -
  | 'slash-total' // 1 / 10
  | 'page-x-of-y' // Page 1 of 10
  | 'p-number' // p. 1
  | 'brackets'; // [ 1 ]

export interface PageNumberConfig {
  position: PageNumberPosition;
  format: PageNumberFormat;
  startFromPage: number; // e.g. 1, or 2 to skip cover
  startingNumber: number; // usually 1
  skipFirstPage: boolean;
  fontSize: number; // 8 - 14
  fontColor: 'black' | 'dark-gray' | 'subtle-gray' | 'indigo';
  fontFamily: 'helvetica' | 'times' | 'courier';
  margin: number; // margin from edge in pt
}
