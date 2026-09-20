import React, { useRef } from 'react';
import {
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Upload,
  Search,
  RotateCw,
  Columns,
  Layers,
  Sparkles,
  Hash,
  FolderDown,
  FileDown,
  BookmarkCheck,
} from 'lucide-react';
import { ViewMode, DocumentInfo } from '../types';
import { SAMPLE_DOCS } from '../utils/samplePdfGenerator';

interface ToolbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitWidth: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onRotate: () => void;
  onFocusSearch: () => void;
  documentInfo: DocumentInfo;
  onLoadSample: (docId: string) => void;
  onUploadFile: (file: File) => void;
  isAiGenerating: boolean;
  onGenerateAiToc: () => void;
  onOpenPageNumberModal: () => void;
  onOpenExportModal: () => void;
  onQuickSaveCurrentPage: () => void;
  selectedPagesCount: number;
  onSavePdfWithToc?: () => void;
  isSavingWithToc?: boolean;
  tocItemsCount?: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  currentPage,
  totalPages,
  onPageChange,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitWidth,
  viewMode,
  onToggleViewMode,
  onRotate,
  onFocusSearch,
  documentInfo,
  onLoadSample,
  onUploadFile,
  isAiGenerating,
  onGenerateAiToc,
  onOpenPageNumberModal,
  onOpenExportModal,
  onQuickSaveCurrentPage,
  selectedPagesCount,
  onSavePdfWithToc,
  isSavingWithToc = false,
  tocItemsCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        onPageChange(val);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onUploadFile(file);
    }
  };

  return (
    <header
      id="app-top-toolbar"
      className="h-14 px-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 select-none z-30 shrink-0"
    >
      {/* Left: Sidebar Toggle + Document Title / Sample selector */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title={sidebarOpen ? 'サイドバーを閉じる' : '目次・検索サイドバーを開く'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

        {/* Current Document Name & Sample Dropdown */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0 hidden sm:block" />
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs font-semibold text-neutral-100 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]"
              title={documentInfo.name}
            >
              {documentInfo.name}
            </span>
          </div>

          {/* Sample PDF Selector */}
          <select
            id="sample-pdf-select"
            onChange={(e) => {
              if (e.target.value) {
                onLoadSample(e.target.value);
              }
            }}
            defaultValue=""
            className="text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500 hidden md:block"
          >
            <option value="" disabled>
              サンプルPDFを選択...
            </option>
            {SAMPLE_DOCS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.pageCount}p)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Page Navigation Controls */}
      <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800/90 rounded-lg p-0.5">
        <button
          id="nav-first-page-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors hidden sm:block"
          title="最初のページへ"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          id="nav-prev-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="前のページへ"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 px-1.5 text-xs font-mono">
          <input
            id="page-jump-input"
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={handlePageInput}
            onBlur={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                onPageChange(val);
              }
            }}
            className="w-10 text-center bg-neutral-900 border border-neutral-700/80 rounded py-0.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
          />
          <span className="text-neutral-500">/</span>
          <span className="text-neutral-400">{totalPages || 1}</span>
        </div>

        <button
          id="nav-next-page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="次のページへ"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          id="nav-last-page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors hidden sm:block"
          title="最後のページへ"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Zoom, View mode, Search shortcut, Upload PDF */}
      <div className="flex items-center gap-1.5">
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800/90 rounded-lg p-0.5 hidden lg:flex">
          <button
            id="zoom-out-btn"
            onClick={onZoomOut}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="縮小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            id="zoom-reset-btn"
            onClick={onZoomReset}
            className="px-2 py-0.5 text-xs font-mono text-neutral-300 hover:text-white rounded hover:bg-neutral-850"
            title="拡大率を100%にリセット"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            id="zoom-in-btn"
            onClick={onZoomIn}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="拡大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            id="fit-width-btn"
            onClick={onFitWidth}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="幅に合わせる"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Toggle (Continuous vs Single Page) */}
        <button
          id="toggle-view-mode-btn"
          onClick={onToggleViewMode}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors hidden sm:flex items-center gap-1 text-xs"
          title={viewMode === 'continuous' ? '単一ページ表示へ切替' : 'スクロール連続表示へ切替'}
        >
          {viewMode === 'continuous' ? (
            <Layers className="w-4 h-4 text-indigo-400" />
          ) : (
            <Columns className="w-4 h-4" />
          )}
        </button>

        {/* Rotate Button */}
        <button
          id="rotate-page-btn"
          onClick={onRotate}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors hidden xl:block"
          title="右に90度回転"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Search focus shortcut */}
        <button
          id="toolbar-search-btn"
          onClick={onFocusSearch}
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 transition-colors"
          title="キーワード検索"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Emerald One-Click Page Save & Page Extraction Buttons */}
        <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-0.5">
          <button
            id="quick-save-page-btn"
            onClick={onQuickSaveCurrentPage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
            title={`現在のページ (${currentPage}p) を指定場所にワンクリック保存`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>このページを保存</span>
          </button>

          <button
            id="open-page-export-modal-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors text-xs font-medium"
            title="複数ページの選択・抽出保存ダイアログを開く"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">ページ抽出</span>
            {selectedPagesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-neutral-950 font-bold font-mono ml-0.5">
                {selectedPagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Page Numbering Feature Button */}
        <button
          id="toolbar-page-number-btn"
          onClick={onOpenPageNumberModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors border border-neutral-700/80"
          title="PDFの各ページにページ番号（ノンブル）を付与"
        >
          <Hash className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">ページ番号付与</span>
        </button>

        {/* Save PDF with Embedded TOC (Bookmarks) Button */}
        {onSavePdfWithToc && (
          <button
            id="toolbar-save-pdf-with-toc-btn"
            onClick={onSavePdfWithToc}
            disabled={isSavingWithToc || tocItemsCount === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 hover:text-white transition-colors border border-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="現在の目次をしおり（アウトライン）として埋め込んだPDFを保存"
          >
            <BookmarkCheck className={`w-3.5 h-3.5 text-indigo-400 ${isSavingWithToc ? 'animate-pulse' : ''}`} />
            <span className="hidden xl:inline">{isSavingWithToc ? '目次保存中...' : '目次付きPDF保存'}</span>
          </button>
        )}

        {/* AI TOC generate quick action */}
        <button
          id="toolbar-ai-toc-btn"
          onClick={onGenerateAiToc}
          disabled={isAiGenerating}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/90 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          title="Gemini AIで見出しと目次を自動解析"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
          <span>{isAiGenerating ? '解析中...' : 'AI目次生成'}</span>
        </button>

        {/* Upload PDF Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="application/pdf"
          className="hidden"
          id="pdf-file-uploader-input"
        />
        <button
          id="upload-pdf-btn"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 hover:bg-white text-neutral-900 transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDFを開く</span>
        </button>
      </div>
    </header>
  );
};
