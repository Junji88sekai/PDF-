import React, { useState } from 'react';
import {
  TocItem,
  SearchMatch,
  SidebarTab,
  PageTextData,
} from '../types';
import {
  ListTree,
  Search,
  BookOpen,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Download,
  Copy,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
  Hash,
  FolderDown,
  FileDown,
  BookmarkCheck,
  BookmarkPlus,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  tocItems: TocItem[];
  currentPage: number;
  totalPages: number;
  pagesData: PageTextData[];
  onJumpToPage: (pageNumber: number) => void;
  // Search
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchMatches: SearchMatch[];
  activeMatchIndex: number;
  onSelectMatch: (index: number) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  isSearching: boolean;
  // AI & Manual TOC
  onGenerateAiToc: () => void;
  isAiGenerating: boolean;
  aiDocumentTitle?: string;
  aiSummary?: string;
  onAddItem: () => void;
  onEditItem: (item: TocItem) => void;
  onDeleteItem: (id: string) => void;
  onResetToc: () => void;
  onOpenPageNumberModal?: () => void;
  onOpenExportModal?: () => void;
  selectedPages?: number[];
  onTogglePageSelection?: (page: number) => void;
  onQuickSavePage?: (page: number) => void;
  onSavePdfWithToc?: () => void;
  isSavingWithToc?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  onTabChange,
  tocItems,
  currentPage,
  totalPages,
  pagesData,
  onJumpToPage,
  searchQuery,
  onSearchQueryChange,
  searchMatches,
  activeMatchIndex,
  onSelectMatch,
  onNextMatch,
  onPrevMatch,
  isSearching,
  onGenerateAiToc,
  isAiGenerating,
  aiDocumentTitle,
  aiSummary,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onResetToc,
  onOpenPageNumberModal,
  onOpenExportModal,
  selectedPages = [],
  onTogglePageSelection,
  onQuickSavePage,
  onSavePdfWithToc,
  isSavingWithToc = false,
}) => {
  const [tocFilter, setTocFilter] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  if (!isOpen) return null;

  // Filter TOC items by search term in TOC tab
  const filteredTocItems = tocItems.filter((item) =>
    item.title.toLowerCase().includes(tocFilter.toLowerCase())
  );

  // Group search matches by page
  const matchesByPage = searchMatches.reduce<Record<number, SearchMatch[]>>((acc, match) => {
    if (!acc[match.pageNumber]) {
      acc[match.pageNumber] = [];
    }
    acc[match.pageNumber].push(match);
    return acc;
  }, {});

  const handleCopyMarkdown = () => {
    const mdLines = ['# 目次 (Table of Contents)\n'];
    tocItems.forEach((item) => {
      const indent = '  '.repeat(item.level - 1);
      mdLines.push(`${indent}- **${item.title}** (Page ${item.pageNumber})`);
    });
    navigator.clipboard.writeText(mdLines.join('\n'));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
    setShowExportMenu(false);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tocItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'table_of_contents.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  return (
    <aside
      id="app-left-sidebar"
      className="w-80 md:w-88 shrink-0 flex flex-col bg-neutral-900/95 border-r border-neutral-800 text-neutral-200 h-full select-none backdrop-blur-sm z-20"
    >
      {/* Sidebar Header & Tab Navigation */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center justify-between gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800/80">
          <button
            id="tab-btn-toc"
            onClick={() => onTabChange('toc')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'toc'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-indigo-400" />
            <span>目次</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700/60 text-neutral-300">
              {tocItems.length}
            </span>
          </button>

          <button
            id="tab-btn-search"
            onClick={() => onTabChange('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>検索</span>
            {searchMatches.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {searchMatches.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-pages"
            onClick={() => onTabChange('pages')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'pages'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>ページ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700/60 text-neutral-300">
              {totalPages}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: 目次 (TOC) */}
      {activeTab === 'toc' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* AI Banner / Document Title Summary */}
          {aiSummary && (
            <div className="p-3 mx-3 mt-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-300 font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiDocumentTitle || 'AI 要約概要'}</span>
              </div>
              <p className="text-neutral-300 leading-relaxed line-clamp-3 text-[11px]">
                {aiSummary}
              </p>
            </div>
          )}

          {/* Action Bar: Filter, AI Generate, Add Item, Export */}
          <div className="p-3 border-b border-neutral-800 flex flex-col gap-2">
            <div className="relative">
              <input
                id="toc-filter-input"
                type="text"
                value={tocFilter}
                onChange={(e) => setTocFilter(e.target.value)}
                placeholder="目次を絞り込み検索..."
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              {tocFilter && (
                <button
                  onClick={() => setTocFilter('')}
                  className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-1">
              <button
                id="generate-ai-toc-btn"
                onClick={onGenerateAiToc}
                disabled={isAiGenerating}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white transition-colors shadow-xs"
                title="Gemini AIでページ構造と見出しを精密解析して目次を再生成"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'AI 解析中...' : 'AIで目次生成'}</span>
              </button>

              <button
                id="add-toc-item-btn"
                onClick={onAddItem}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="目次項目を手動追加"
              >
                <Plus className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  id="toc-export-menu-btn"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  title="目次の書き出し"
                >
                  <Download className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div
                    id="toc-export-dropdown"
                    className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl py-1 z-30 text-xs"
                  >
                    {onSavePdfWithToc && (
                      <button
                        onClick={() => {
                          onSavePdfWithToc();
                          setShowExportMenu(false);
                        }}
                        disabled={isSavingWithToc || tocItems.length === 0}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-800 text-indigo-300 hover:text-indigo-200 font-medium disabled:opacity-50"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>目次付きPDFを保存</span>
                      </button>
                    )}
                    <button
                      onClick={handleCopyMarkdown}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-neutral-800 text-neutral-200"
                    >
                      {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedExport ? 'コピー完了' : 'Markdownコピー'}</span>
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-neutral-800 text-neutral-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSONダウンロード</span>
                    </button>
                    <div className="my-1 border-t border-neutral-800" />
                    <button
                      onClick={() => {
                        onResetToc();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ルール解析で再作成</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOC Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredTocItems.length === 0 ? (
              <div className="py-12 px-4 text-center text-neutral-500 text-xs">
                <ListTree className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{tocFilter ? '一致する見出しがありません' : '目次がありません'}</p>
                <p className="mt-1 text-neutral-600">「AIで目次生成」を押して自動解析できます</p>
              </div>
            ) : (
              filteredTocItems.map((item) => {
                const isCurrent = currentPage === item.pageNumber;
                return (
                  <div
                    key={item.id}
                    id={`toc-item-${item.id}`}
                    onClick={() => onJumpToPage(item.pageNumber)}
                    className={`group relative flex items-start gap-2 py-2 px-2.5 rounded-lg cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/60 border border-indigo-800/60 text-indigo-100'
                        : 'hover:bg-neutral-800/70 text-neutral-300 hover:text-neutral-100 border border-transparent'
                    } ${
                      item.level === 1
                        ? 'font-medium'
                        : item.level === 2
                        ? 'ml-3 text-xs'
                        : 'ml-6 text-[11px] text-neutral-400'
                    }`}
                  >
                    {/* Level marker */}
                    <div className="mt-0.5 shrink-0">
                      {item.level === 1 ? (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrent ? 'bg-indigo-400' : 'bg-neutral-600 group-hover:bg-neutral-400'
                          }`}
                        />
                      ) : (
                        <span className="text-neutral-600 text-[10px]">└</span>
                      )}
                    </div>

                    {/* Title and snippet */}
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="leading-snug break-words line-clamp-2">
                        {item.title}
                      </div>
                      {item.snippet && item.level === 1 && (
                        <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                          {item.snippet}
                        </div>
                      )}
                    </div>

                    {/* Page number badge & Actions */}
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-neutral-800 group-hover:bg-neutral-700 text-neutral-400 group-hover:text-neutral-200'
                        }`}
                        title={`${item.pageNumber}ページへジャンプ`}
                      >
                        p.{item.pageNumber}
                      </span>

                      {/* Edit / Delete actions on hover */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
                          title="編集"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-red-400"
                          title="削除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TOC Save PDF Footer */}
          {onSavePdfWithToc && (
            <div className="p-3 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-sm shrink-0">
              <button
                id="sidebar-save-pdf-with-toc-btn"
                onClick={onSavePdfWithToc}
                disabled={isSavingWithToc || tocItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-950/50 hover:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="現在の目次をPDF本体の「しおり（アウトライン）」として埋め込んで保存"
              >
                <BookmarkCheck className={`w-4 h-4 text-indigo-200 ${isSavingWithToc ? 'animate-pulse' : ''}`} />
                <span>{isSavingWithToc ? '目次を埋め込み中...' : '目次付きPDFを保存'}</span>
              </button>
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                <BookmarkPlus className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Adobe Acrobat等のしおりに反映されます</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 検索 (Search) */}
      {activeTab === 'search' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Box */}
          <div className="p-3 border-b border-neutral-800 space-y-2">
            <div className="relative">
              <input
                id="sidebar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="PDF内をキーワード検索..."
                className="w-full pl-8 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                autoFocus
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  id="clear-search-query-btn"
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-neutral-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Match Counter & Next/Prev Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-neutral-400 font-medium">
                {searchQuery ? (
                  searchMatches.length > 0 ? (
                    <span className="text-amber-400">
                      {activeMatchIndex + 1} / {searchMatches.length} 件の一致
                    </span>
                  ) : (
                    '一致する単語なし'
                  )
                ) : (
                  '単語を入力してください'
                )}
              </span>

              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    id="prev-search-match-btn"
                    onClick={onPrevMatch}
                    className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="前の一致へ (Shift+Enter)"
                  >
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    id="next-search-match-btn"
                    onClick={onNextMatch}
                    className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="次の一致へ (Enter)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Matches List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {searchQuery ? (
              searchMatches.length === 0 ? (
                <div className="py-12 px-4 text-center text-neutral-500 text-xs">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>「{searchQuery}」は見つかりませんでした</p>
                  <p className="mt-1 text-neutral-600">スペルをご確認いただくか、他のキーワードをお試しください</p>
                </div>
              ) : (
                Object.entries(matchesByPage).map(([pageStr, matches]) => {
                  const pageNum = Number(pageStr);
                  return (
                    <div key={`search-group-p${pageNum}`} className="space-y-1">
                      {/* Page header */}
                      <div
                        onClick={() => onJumpToPage(pageNum)}
                        className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          <span>ページ {pageNum}</span>
                        </span>
                        <span className="text-[10px] bg-neutral-800 px-1.5 py-0.2 rounded font-mono text-neutral-400">
                          {matches.length} 件
                        </span>
                      </div>

                      {/* Matches in this page */}
                      {matches.map((m) => {
                        const isSelected = activeMatchIndex === m.matchIndex;
                        return (
                          <div
                            key={m.id}
                            id={`search-match-${m.id}`}
                            onClick={() => {
                              onSelectMatch(m.matchIndex);
                              onJumpToPage(m.pageNumber);
                            }}
                            className={`p-2 rounded-lg cursor-pointer text-xs border transition-all ${
                              isSelected
                                ? 'bg-amber-950/50 border-amber-500/50 text-amber-100 ring-1 ring-amber-500/40'
                                : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/60 text-neutral-300'
                            }`}
                          >
                            <p className="leading-relaxed break-words text-[11px]">
                              <span className="text-neutral-400">{m.beforeSnippet}</span>
                              <mark className="bg-amber-400 text-neutral-950 font-bold px-0.5 rounded-xs mx-0.5">
                                {m.matchWord}
                              </mark>
                              <span className="text-neutral-400">{m.afterSnippet}</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )
            ) : (
              <div className="py-12 px-4 text-center text-neutral-500 text-xs">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                <p>上部の入力欄に探したい単語を入力してください</p>
                <p className="mt-1 text-neutral-600">全ページのテキストから即座に一致箇所を検出し、ハイライトします</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ページ一覧 (Pages) */}
      {activeTab === 'pages' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Emerald Page Extraction Shortcut Card */}
          {onOpenExportModal && (
            <button
              id="sidebar-open-export-modal-btn"
              type="button"
              onClick={onOpenExportModal}
              className="w-full p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 hover:text-white transition-all flex items-center justify-between text-left group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FolderDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-100">ページ抽出・保存</div>
                  <div className="text-[10px] text-emerald-300/70">1枚または複数を選択して保存</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {onOpenPageNumberModal && (
            <button
              id="sidebar-open-page-number-btn"
              type="button"
              onClick={onOpenPageNumberModal}
              className="w-full p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 hover:text-white transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">ページ番号を付与</div>
                  <div className="text-[10px] text-indigo-300/70">位置・書式を設定して印字</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400/60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <div className="space-y-1.5">
            {pagesData.map((p) => {
            const isCurrent = currentPage === p.pageNumber;
            const isSelected = selectedPages.includes(p.pageNumber);
            const topHeading = p.headings[0]?.text || p.lines[0] || `ページ ${p.pageNumber}`;
            return (
              <div
                key={`page-thumb-${p.pageNumber}`}
                id={`page-nav-item-${p.pageNumber}`}
                onClick={() => onJumpToPage(p.pageNumber)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                    : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-800/60 text-neutral-300'
                }`}
              >
                <div
                  className={`w-7 h-9 rounded flex items-center justify-center font-mono text-xs shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold'
                      : isCurrent
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {p.pageNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-neutral-200">
                    {topHeading}
                  </div>
                  <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {p.lines.slice(1, 3).join(' ')}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  {onQuickSavePage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickSavePage(p.pageNumber);
                      }}
                      className="p-1 rounded hover:bg-emerald-950 text-neutral-500 hover:text-emerald-400 transition-colors"
                      title={`ページ ${p.pageNumber} を指定場所に保存`}
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onTogglePageSelection && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePageSelection(p.pageNumber);
                      }}
                      className={`p-1 rounded text-xs font-mono font-bold ${
                        isSelected ? 'text-emerald-400' : 'text-neutral-600 hover:text-neutral-300'
                      }`}
                      title="選択トグル"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500">
        <span>全 {totalPages} ページ</span>
        <span>目次 {tocItems.length} 項目</span>
      </div>
    </aside>
  );
};
