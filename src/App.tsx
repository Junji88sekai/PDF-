import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { pdfjsLib } from './utils/pdfWorker';
import {
  TocItem,
  SearchMatch,
  PageTextData,
  DocumentInfo,
  SidebarTab,
  ViewMode,
} from './types';
import {
  extractDocumentText,
  extractNativeOutline,
  generateHeuristicToc,
  generateAiToc,
  searchDocumentText,
} from './utils/pdfExtractor';
import { generateSamplePdf, SAMPLE_DOCS } from './utils/samplePdfGenerator';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PdfViewer } from './components/PdfViewer';
import { TocEditModal } from './components/TocEditModal';
import { PageNumberModal } from './components/PageNumberModal';
import { PageExportModal } from './components/PageExportModal';
import { extractPagesToNewPdf, saveFileWithPickerOrDownload } from './utils/pdfPageExporter';
import { addPageNumbersToPdf } from './utils/pdfPageNumberer';
import { PageNumberConfig } from './types';

export default function App() {
  // Document state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPdfBytes, setCurrentPdfBytes] = useState<Uint8Array | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    name: 'AI_Architecture_Whitepaper.pdf',
    totalPages: 8,
    isSample: true,
  });
  const [pagesData, setPagesData] = useState<PageTextData[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);

  // Viewer state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('continuous');

  // Sidebar & Navigation state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('toc');
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  // AI TOC state
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiDocTitle, setAiDocTitle] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string>('');

  // TOC Item Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<TocItem | null>(null);

  // Page Number Modal
  const [isPageNumberModalOpen, setIsPageNumberModalOpen] = useState<boolean>(false);

  // Page Selection & Extraction state
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Load a PDF ArrayBuffer into the viewer and extract text/TOC
  const loadPdfData = useCallback(async (data: Uint8Array | ArrayBuffer, docName: string, isSample = false) => {
    setIsLoadingDoc(true);
    setDocError(null);
    setSearchQuery('');
    setSearchMatches([]);
    setActiveMatchIndex(0);
    setAiDocTitle('');
    setAiSummary('');

    // Keep raw bytes for page numbering and download features
    const rawBytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data).slice();
    setCurrentPdfBytes(rawBytes);

    try {
      const loadingTask = pdfjsLib.getDocument({
        data: rawBytes.slice(),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);

      const numPages = loadedPdf.numPages;
      setDocumentInfo({
        name: docName,
        totalPages: numPages,
        isSample,
      });
      setCurrentPage(1);

      // Extract text content & typography from all pages
      const extractedPages = await extractDocumentText(loadedPdf);
      setPagesData(extractedPages);

      // 1. Try native outline first
      const nativeOutline = await extractNativeOutline(loadedPdf);
      if (nativeOutline && nativeOutline.length > 0) {
        setTocItems(nativeOutline);
      } else {
        // 2. Generate rule-based TOC from headings and page breaks
        const generatedToc = generateHeuristicToc(extractedPages);
        setTocItems(generatedToc);
      }
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setDocError(err.message || 'PDFの解析に失敗しました。有効なPDFファイルか確認してください。');
    } finally {
      setIsLoadingDoc(false);
    }
  }, []);

  // Initial mount: load sample PDF
  useEffect(() => {
    async function init() {
      try {
        const sampleBytes = await generateSamplePdf('ai-whitepaper');
        await loadPdfData(sampleBytes, 'AI_Architecture_Whitepaper.pdf', true);
      } catch (e: any) {
        console.error('Failed to init sample PDF:', e);
        setDocError('サンプルPDFの生成に失敗しました');
        setIsLoadingDoc(false);
      }
    }
    init();
  }, [loadPdfData]);

  // Load sample document from dropdown
  const handleLoadSample = async (docId: string) => {
    const config = SAMPLE_DOCS.find((d) => d.id === docId) || SAMPLE_DOCS[0];
    const sampleBytes = await generateSamplePdf(docId);
    await loadPdfData(sampleBytes, config.name, true);
  };

  // Upload user file
  const handleUploadFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    await loadPdfData(new Uint8Array(arrayBuffer), file.name, false);
  };

  // Jump to specific page
  const handleJumpToPage = useCallback((pageNum: number) => {
    const bounded = Math.max(1, Math.min(documentInfo.totalPages, pageNum));
    setCurrentPage(bounded);

    // If continuous view, scroll to target element
    if (viewMode === 'continuous') {
      const el = document.getElementById(`pdf-page-wrapper-${bounded}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [documentInfo.totalPages, viewMode]);

  // Full-text search effect
  useEffect(() => {
    if (!searchQuery.trim() || pagesData.length === 0) {
      setSearchMatches([]);
      setActiveMatchIndex(0);
      return;
    }

    const matches = searchDocumentText(pagesData, searchQuery);
    setSearchMatches(matches);
    setActiveMatchIndex(0);

    // If matches found, jump to the page of the first match
    if (matches.length > 0) {
      handleJumpToPage(matches[0].pageNumber);
    }
  }, [searchQuery, pagesData, handleJumpToPage]);

  // Next / Previous match navigation
  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % searchMatches.length;
    setActiveMatchIndex(nextIdx);
    handleJumpToPage(searchMatches[nextIdx].pageNumber);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setActiveMatchIndex(prevIdx);
    handleJumpToPage(searchMatches[prevIdx].pageNumber);
  };

  // AI TOC generation trigger
  const handleGenerateAiToc = async () => {
    if (pagesData.length === 0 || isAiGenerating) return;
    setIsAiGenerating(true);

    try {
      const result = await generateAiToc(pagesData, documentInfo.name);
      if (result.items && result.items.length > 0) {
        setTocItems(result.items);
      }
      if (result.documentTitle) setAiDocTitle(result.documentTitle);
      if (result.summary) setAiSummary(result.summary);
      setActiveTab('toc');
    } catch (err: any) {
      console.warn('AI TOC generation failed, keeping local TOC:', err);
      alert(`AI目次生成: ${err.message || 'APIの呼び出しに失敗しました。現在のルール生成目次を保持します。'}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Reset TOC to rule-based heuristic
  const handleResetToc = () => {
    if (pagesData.length > 0) {
      const heuristicItems = generateHeuristicToc(pagesData);
      setTocItems(heuristicItems);
      setAiSummary('');
    }
  };

  // Add or Edit TOC item
  const handleSaveTocItem = (itemData: Partial<TocItem>) => {
    if (editingItem) {
      // Edit existing
      setTocItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData } : item
        )
      );
    } else {
      // Add new item
      const newItem: TocItem = {
        id: `manual-toc-${Date.now()}`,
        title: itemData.title || '新しいセクション',
        pageNumber: itemData.pageNumber || currentPage,
        level: itemData.level || 1,
      };
      // Insert sorted by page number
      setTocItems((prev) => {
        const next = [...prev, newItem];
        return next.sort((a, b) => a.pageNumber - b.pageNumber);
      });
    }
    setEditingItem(null);
  };

  const handleDeleteTocItem = (id: string) => {
    setTocItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Page numbering handlers
  const handleApplyPageNumbers = async (config: PageNumberConfig) => {
    if (!currentPdfBytes) {
      throw new Error('PDFデータが読み込まれていません');
    }
    const modifiedBytes = await addPageNumbersToPdf(currentPdfBytes, config);
    // Reload into viewer
    await loadPdfData(modifiedBytes, documentInfo.name, false);
  };

  const handleDownloadNumberedPdf = async (config: PageNumberConfig) => {
    if (!currentPdfBytes) {
      throw new Error('PDFデータが読み込まれていません');
    }
    const modifiedBytes = await addPageNumbersToPdf(currentPdfBytes, config);
    const blob = new Blob([modifiedBytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = documentInfo.name.replace(/\.pdf$/i, '');
    a.download = `${baseName}_numbered.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  // Page selection handlers
  const handleTogglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleSelectAllPages = () => {
    setSelectedPages(Array.from({ length: documentInfo.totalPages }, (_, i) => i + 1));
  };

  const handleClearPageSelection = () => {
    setSelectedPages([]);
  };

  // 1-Click Quick Save single page directly to designated place
  const handleQuickSavePage = async (targetPageNum: number) => {
    if (!currentPdfBytes) {
      alert('PDFデータが読み込まれていません');
      return;
    }
    try {
      const baseName = documentInfo.name.replace(/\.pdf$/i, '');
      const suggestedName = `${baseName}_page_${targetPageNum}.pdf`;
      const singlePagePdfBytes = await extractPagesToNewPdf(currentPdfBytes, [targetPageNum]);
      await saveFileWithPickerOrDownload(
        singlePagePdfBytes,
        suggestedName,
        'application/pdf',
        `ページ ${targetPageNum} のPDF`
      );
    } catch (err: any) {
      alert(`保存に失敗しました: ${err.message || err}`);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, +(prev - 0.15).toFixed(2)));
  const handleZoomReset = () => setScale(1.0);
  const handleFitWidth = () => {
    const container = document.getElementById('pdf-viewer-container');
    if (container) {
      const containerWidth = container.clientWidth - 80;
      // standard A4 width is ~595px
      const calculatedScale = Math.max(0.6, Math.min(2.2, +(containerWidth / 620).toFixed(2)));
      setScale(calculatedScale);
    } else {
      setScale(1.35);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input, ignore global navigation
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Enter' && activeTab === 'search') {
          if (e.shiftKey) {
            handlePrevMatch();
          } else {
            handleNextMatch();
          }
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveTab('search');
        document.getElementById('sidebar-search-input')?.focus();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleJumpToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handleJumpToPage(currentPage - 1);
      } else if (e.key === 'Home') {
        handleJumpToPage(1);
      } else if (e.key === 'End') {
        handleJumpToPage(documentInfo.totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, documentInfo.totalPages, activeTab, handleJumpToPage, handleNextMatch, handlePrevMatch]);

  const activeMatch = useMemo(
    () => searchMatches[activeMatchIndex] || null,
    [searchMatches, activeMatchIndex]
  );

  return (
    <div id="pdf-reader-app-root" className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-sans">
      {/* Top Application Toolbar */}
      <Toolbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        totalPages={documentInfo.totalPages}
        onPageChange={handleJumpToPage}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitWidth={handleFitWidth}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'continuous' ? 'single' : 'continuous')}
        onRotate={() => setRotation((prev) => (prev + 90) % 360)}
        onFocusSearch={() => {
          setSidebarOpen(true);
          setActiveTab('search');
          setTimeout(() => {
            document.getElementById('sidebar-search-input')?.focus();
          }, 50);
        }}
        documentInfo={documentInfo}
        onLoadSample={handleLoadSample}
        onUploadFile={handleUploadFile}
        isAiGenerating={isAiGenerating}
        onGenerateAiToc={handleGenerateAiToc}
        onOpenPageNumberModal={() => setIsPageNumberModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onQuickSaveCurrentPage={() => handleQuickSavePage(currentPage)}
        selectedPagesCount={selectedPages.length}
      />

      {/* Main Content Area: Left Sidebar + PDF Viewer */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Sidebar (TOC, Search, Pages) */}
        <Sidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tocItems={tocItems}
          currentPage={currentPage}
          totalPages={documentInfo.totalPages}
          pagesData={pagesData}
          onJumpToPage={handleJumpToPage}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchMatches={searchMatches}
          activeMatchIndex={activeMatchIndex}
          onSelectMatch={(idx) => setActiveMatchIndex(idx)}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          isSearching={false}
          onGenerateAiToc={handleGenerateAiToc}
          isAiGenerating={isAiGenerating}
          aiDocumentTitle={aiDocTitle}
          aiSummary={aiSummary}
          onAddItem={() => {
            setEditingItem(null);
            setIsEditModalOpen(true);
          }}
          onEditItem={(item) => {
            setEditingItem(item);
            setIsEditModalOpen(true);
          }}
          onDeleteItem={handleDeleteTocItem}
          onResetToc={handleResetToc}
          onOpenPageNumberModal={() => setIsPageNumberModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          selectedPages={selectedPages}
          onTogglePageSelection={handleTogglePageSelection}
          onQuickSavePage={handleQuickSavePage}
        />

        {/* PDF Viewer Canvas Display */}
        <PdfViewer
          pdfDoc={pdfDoc}
          totalPages={documentInfo.totalPages}
          currentPage={currentPage}
          onPageVisible={(pageNum) => setCurrentPage(pageNum)}
          scale={scale}
          rotation={rotation}
          viewMode={viewMode}
          searchQuery={searchQuery}
          searchMatches={searchMatches}
          activeMatch={activeMatch}
          isLoading={isLoadingDoc}
          error={docError}
          onDropFile={handleUploadFile}
          selectedPages={selectedPages}
          onTogglePageSelection={handleTogglePageSelection}
          onQuickSavePage={handleQuickSavePage}
        />
      </div>

      {/* Add / Edit TOC Item Modal */}
      <TocEditModal
        isOpen={isEditModalOpen}
        item={editingItem}
        totalPages={documentInfo.totalPages}
        onSave={handleSaveTocItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Page Numbering Modal */}
      <PageNumberModal
        isOpen={isPageNumberModalOpen}
        totalPages={documentInfo.totalPages}
        documentName={documentInfo.name}
        onApplyToViewer={handleApplyPageNumbers}
        onDownload={handleDownloadNumberedPdf}
        onClose={() => setIsPageNumberModalOpen(false)}
      />

      {/* Page Extraction & Save Modal */}
      <PageExportModal
        isOpen={isExportModalOpen}
        totalPages={documentInfo.totalPages}
        currentPage={currentPage}
        documentName={documentInfo.name}
        sourcePdfBytes={currentPdfBytes}
        pdfDoc={pdfDoc}
        selectedPages={selectedPages}
        onTogglePageSelection={handleTogglePageSelection}
        onSelectAllPages={handleSelectAllPages}
        onClearPageSelection={handleClearPageSelection}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
