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
  onLoadSample?: (docId: string) => void;
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
      className="h-14 px-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 select-none z-30 shrink-0 overflow-x-auto"
    >
      {/* Left: Sidebar Toggle + Document Title / Sample selector */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors border border-neutral-700/60 shrink-0"
          title={sidebarOpen ? 'サイドバーを閉じる' : '目次・検索サイドバーを開く'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* User uploaded document name (hidden for default/sample to keep toolbar clean) */}
        {!documentInfo.isSample && documentInfo.name && (
          <>
            <div className="h-5 w-px bg-neutral-800 hidden sm:block" />
            <div className="flex items-center gap-1.5 min-w-0">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0 hidden sm:block" />
              <span
                className="text-xs font-semibold text-neutral-100 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]"
                title={documentInfo.name}
              >
                {documentInfo.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Center: Page Navigation Controls */}
      <div className="h-8 flex items-center gap-1 bg-neutral-950 border border-neutral-800/90 rounded-lg px-1 py-0.5 shrink-0">
        <button
          id="nav-first-page-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors hidden sm:block"
          title="最初のページへ"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          id="nav-prev-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="次のページへ"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          id="nav-last-page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors hidden sm:block"
          title="最後のページへ"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Zoom, View mode, Search shortcut, Feature Actions, Upload PDF */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Zoom Controls */}
        <div className="h-8 flex items-center gap-0.5 bg-neutral-950 border border-neutral-800/90 rounded-lg px-1 py-0.5 hidden lg:flex shrink-0">
          <button
            id="zoom-out-btn"
            onClick={onZoomOut}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
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
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="拡大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            id="fit-width-btn"
            onClick={onFitWidth}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="幅に合わせる"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Toggle (Continuous vs Single Page) */}
        <button
          id="toggle-view-mode-btn"
          onClick={onToggleViewMode}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 flex items-center justify-center transition-colors hidden sm:flex shrink-0"
          title={viewMode === 'continuous' ? '単一ページ表示へ切替' : 'スクロール連続表示へ切替'}
        >
          {viewMode === 'continuous' ? (
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Columns className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Rotate Button */}
        <button
          id="rotate-page-btn"
          onClick={onRotate}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 flex items-center justify-center transition-colors hidden xl:flex shrink-0"
          title="右に90度回転"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Search focus shortcut */}
        <button
          id="toolbar-search-btn"
          onClick={onFocusSearch}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 border border-neutral-700/60 flex items-center justify-center transition-colors shrink-0"
          title="キーワード検索"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <div className="h-5 w-px bg-neutral-800 hidden md:block" />

        {/* Page Save & Page Extraction Action Buttons */}
        <button
          id="quick-save-page-btn"
          onClick={onQuickSaveCurrentPage}
          className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-neutral-600 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 hidden 2xl:flex"
          title={`現在のページ (${currentPage}p) を指定場所にワンクリック保存`}
        >
          <FileDown className="w-3.5 h-3.5 text-neutral-400" />
          <span>現ページ保存</span>
        </button>

        <button
          id="open-page-export-modal-btn"
          onClick={onOpenExportModal}
          className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-neutral-600 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          title="複数ページの選択・抽出保存ダイアログを開く"
        >
          <FolderDown className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden lg:inline">ページ抽出</span>
          {selectedPagesCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-bold font-mono ml-0.5">
              {selectedPagesCount}
            </span>
          )}
        </button>

        {/* Page Numbering Feature Button */}
        <button
          id="toolbar-page-number-btn"
          onClick={onOpenPageNumberModal}
          className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-neutral-600 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          title="PDFの各ページにページ番号（ノンブル）を付与"
        >
          <Hash className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden xl:inline">ページ番号付与</span>
        </button>

        {/* Save PDF with Embedded TOC (Bookmarks) Button */}
        {onSavePdfWithToc && (
          <button
            id="toolbar-save-pdf-with-toc-btn"
            onClick={onSavePdfWithToc}
            disabled={isSavingWithToc || tocItemsCount === 0}
            className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            title="現在の目次をしおり（アウトライン）として埋め込んだPDFを保存"
          >
            <BookmarkCheck className={`w-3.5 h-3.5 text-indigo-400 ${isSavingWithToc ? 'animate-pulse' : ''}`} />
            <span className="hidden md:inline">{isSavingWithToc ? '保存中...' : '目次付き保存'}</span>
          </button>
        )}

        {/* AI TOC generate quick action */}
        <button
          id="toolbar-ai-toc-btn"
          onClick={onGenerateAiToc}
          disabled={isAiGenerating}
          className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border border-indigo-500/50 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          title="Gemini AIで見出しと目次を自動解析"
        >
          <Sparkles className={`w-3.5 h-3.5 text-indigo-200 ${isAiGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isAiGenerating ? '解析中...' : 'AI目次生成'}</span>
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
          className="h-8 px-3 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-white active:bg-neutral-200 text-neutral-900 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          title="ローカルのPDFファイルを開く"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-800" />
          <span>PDFを開く</span>
        </button>
      </div>
    </header>
  );
};
