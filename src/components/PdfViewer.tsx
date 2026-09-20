import React, { useEffect, useRef, useState } from 'react';
import { ViewMode, SearchMatch } from '../types';
import { Loader2, FileUp, AlertCircle, Search, FileDown, CheckSquare, Square } from 'lucide-react';

interface PdfViewerProps {
  pdfDoc: any;
  totalPages: number;
  currentPage: number;
  onPageVisible: (pageNumber: number) => void;
  scale: number;
  rotation: number;
  viewMode: ViewMode;
  searchQuery: string;
  searchMatches: SearchMatch[];
  activeMatch: SearchMatch | null;
  isLoading: boolean;
  error: string | null;
  onDropFile: (file: File) => void;
  selectedPages?: number[];
  onTogglePageSelection?: (page: number) => void;
  onQuickSavePage?: (page: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfDoc,
  totalPages,
  currentPage,
  onPageVisible,
  scale,
  rotation,
  viewMode,
  searchQuery,
  searchMatches,
  activeMatch,
  isLoading,
  error,
  onDropFile,
  selectedPages = [],
  onTogglePageSelection,
  onQuickSavePage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedPages, setRenderedPages] = useState<{ [pageNum: number]: boolean }>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Group search matches by page for highlight badges
  const pageMatchCounts = searchMatches.reduce<Record<number, number>>((acc, m) => {
    acc[m.pageNumber] = (acc[m.pageNumber] || 0) + 1;
    return acc;
  }, {});

  // Drag and drop handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      onDropFile(file);
    }
  };

  // IntersectionObserver for continuous scroll mode to track active page
  useEffect(() => {
    if (viewMode !== 'continuous' || !containerRef.current || !pdfDoc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute('data-page-number'));
            if (pageNum) {
              onPageVisible(pageNum);
            }
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.3,
      }
    );

    const pageElements = containerRef.current.querySelectorAll('.pdf-page-wrapper');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [viewMode, pdfDoc, totalPages, onPageVisible]);

  // Render individual page onto canvas
  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async (pageNum: number) => {
      try {
        const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
        if (!canvas) return;

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale, rotation });

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        await page.render(renderContext).promise;

        setRenderedPages((prev) => ({ ...prev, [pageNum]: true }));
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Render error page ${pageNum}:`, err);
        }
      }
    };

    if (viewMode === 'single') {
      renderPage(currentPage);
    } else {
      // Render all pages in continuous view
      for (let p = 1; p <= totalPages; p++) {
        renderPage(p);
      }
    }
  }, [pdfDoc, currentPage, scale, rotation, viewMode, totalPages]);

  // When activeMatch changes or currentPage changes, ensure page is scrolled into view in continuous mode
  useEffect(() => {
    if (viewMode === 'continuous' && containerRef.current) {
      const pageEl = document.getElementById(`pdf-page-wrapper-${currentPage}`);
      if (pageEl) {
        // Check if page element is already near view
        const containerRect = containerRef.current.getBoundingClientRect();
        const pageRect = pageEl.getBoundingClientRect();
        const isVisible = pageRect.top >= containerRect.top - 100 && pageRect.bottom <= containerRect.bottom + 100;

        if (!isVisible) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [currentPage, viewMode]);

  return (
    <main
      id="pdf-viewer-container"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 relative overflow-auto bg-neutral-950/90 flex flex-col items-center p-4 sm:p-6 transition-colors ${
        isDraggingOver ? 'bg-indigo-950/30 ring-2 ring-indigo-500 ring-inset' : ''
      }`}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-indigo-950/80 backdrop-blur-xs text-white pointer-events-none">
          <FileUp className="w-16 h-16 text-indigo-400 animate-bounce mb-3" />
          <p className="text-base font-semibold">ここにPDFファイルをドロップ</p>
          <p className="text-xs text-indigo-300 mt-1">瞬時にテキストと目次を読み込みます</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-neutral-400">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-200">PDFを解析中...</p>
          <p className="text-xs text-neutral-500 mt-1">ページ構造とテキスト、見出しを抽出しています</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="my-16 p-6 max-w-md bg-red-950/50 border border-red-800/80 rounded-xl text-center text-red-200">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold">PDFの読み込みに失敗しました</h4>
          <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Render Pages */}
      {!isLoading && !error && pdfDoc && (
        <div
          id="pdf-pages-scroll-stack"
          className="flex flex-col items-center gap-6 max-w-full pb-16"
        >
          {viewMode === 'continuous' ? (
            // Continuous view: list all pages
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const matchCount = pageMatchCounts[pageNum] || 0;
              const hasActiveMatch = activeMatch?.pageNumber === pageNum;
              const isSelected = selectedPages.includes(pageNum);

              return (
                <div
                  key={`page-${pageNum}`}
                  id={`pdf-page-wrapper-${pageNum}`}
                  data-page-number={pageNum}
                  className={`pdf-page-wrapper relative rounded-lg shadow-2xl transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 shadow-emerald-950/50'
                      : currentPage === pageNum
                      ? 'ring-2 ring-indigo-500/70 shadow-indigo-950/40'
                      : 'border border-neutral-800/70'
                  }`}
                >
                  {/* Page header tag, Selection toggle & Emerald Save button */}
                  <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[11px] text-neutral-400 px-1 select-none">
                    <div className="flex items-center gap-2">
                      {onTogglePageSelection && (
                        <button
                          type="button"
                          onClick={() => onTogglePageSelection(pageNum)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300'
                          }`}
                          title={isSelected ? '選択を解除' : '保存対象として選択'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3 h-3 text-white" />
                          ) : (
                            <Square className="w-3 h-3 text-neutral-500" />
                          )}
                          <span>ページ {pageNum}</span>
                        </button>
                      )}
                      <span className="font-mono text-[10px] text-neutral-500">
                        / {totalPages}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchCount > 0 && (
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            hasActiveMatch
                              ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          <Search className="w-2.5 h-2.5" />
                          <span>「{searchQuery}」: {matchCount}件一致</span>
                        </span>
                      )}

                      {/* Emerald 1-Click Save this page button */}
                      {onQuickSavePage && (
                        <button
                          type="button"
                          onClick={() => onQuickSavePage(pageNum)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-600/70 text-[10px] font-medium transition-all shadow-xs"
                          title={`このページ (${pageNum}p) を指定場所にワンクリック保存`}
                        >
                          <FileDown className="w-3 h-3 text-emerald-400" />
                          <span>保存</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PDF Canvas */}
                  <canvas
                    id={`pdf-canvas-${pageNum}`}
                    className="rounded-lg bg-white block shadow-lg"
                  />
                </div>
              );
            })
          ) : (
            // Single page view: show only current page
            <div
              id={`pdf-page-wrapper-${currentPage}`}
              className="pdf-page-wrapper relative rounded-lg shadow-2xl border border-neutral-800/80"
            >
              <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[11px] text-neutral-400 px-1 select-none">
                <div className="flex items-center gap-2">
                  <span className="font-mono">ページ {currentPage} / {totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  {pageMatchCounts[currentPage] > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Search className="w-2.5 h-2.5" />
                      <span>「{searchQuery}」: {pageMatchCounts[currentPage]}件一致</span>
                    </span>
                  )}

                  {onQuickSavePage && (
                    <button
                      type="button"
                      onClick={() => onQuickSavePage(currentPage)}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium border border-emerald-500 text-[10px] transition-all shadow-sm"
                      title={`現在表示中のページ (${currentPage}p) を指定場所に保存`}
                    >
                      <FileDown className="w-3 h-3" />
                      <span>このページを保存</span>
                    </button>
                  )}
                </div>
              </div>

              <canvas
                id={`pdf-canvas-${currentPage}`}
                className="rounded-lg bg-white block shadow-lg"
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
};
