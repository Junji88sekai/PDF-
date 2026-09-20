import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Square,
  FileText,
  Image,
  FolderDown,
  Loader2,
} from 'lucide-react';
import { extractPagesToNewPdf, saveFileWithPickerOrDownload, exportPageAsImage } from '../utils/pdfPageExporter';

interface PageExportModalProps {
  isOpen: boolean;
  totalPages: number;
  currentPage: number;
  documentName: string;
  sourcePdfBytes: Uint8Array | null;
  pdfDoc: any;
  selectedPages: number[];
  onTogglePageSelection: (page: number) => void;
  onSelectAllPages: () => void;
  onClearPageSelection: () => void;
  onClose: () => void;
}

export const PageExportModal: React.FC<PageExportModalProps> = ({
  isOpen,
  totalPages,
  currentPage,
  documentName,
  sourcePdfBytes,
  pdfDoc,
  selectedPages,
  onTogglePageSelection,
  onSelectAllPages,
  onClearPageSelection,
  onClose,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('pdf');
  const [customRangeInput, setCustomRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // If no pages currently selected when opening, default to current page
  useEffect(() => {
    if (isOpen && selectedPages.length === 0) {
      onTogglePageSelection(currentPage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Parse range input like "1, 3, 5-8"
  const handleApplyRangeInput = () => {
    if (!customRangeInput.trim()) return;
    const parts = customRangeInput.split(/[,、\s]+/);
    const pagesToAdd: number[] = [];

    parts.forEach((part) => {
      if (part.includes('-') || part.includes('〜') || part.includes('~')) {
        const [startStr, endStr] = part.split(/[-〜~]/);
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            pagesToAdd.push(p);
          }
        }
      } else {
        const single = parseInt(part, 10);
        if (!isNaN(single) && single >= 1 && single <= totalPages) {
          pagesToAdd.push(single);
        }
      }
    });

    onClearPageSelection();
    pagesToAdd.forEach((p) => onTogglePageSelection(p));
    setCustomRangeInput('');
  };

  // Quick select presets
  const handleSelectCurrentPageOnly = () => {
    onClearPageSelection();
    onTogglePageSelection(currentPage);
  };

  // Execute extraction & save to user's designated location
  const handleExecuteSave = async () => {
    if (selectedPages.length === 0) {
      alert('保存するページを選択してください。');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('保存先を選択中...');

    try {
      const baseName = documentName.replace(/\.pdf$/i, '');
      const sortedPages = [...selectedPages].sort((a, b) => a - b);

      if (exportFormat === 'pdf') {
        if (!sourcePdfBytes) {
          throw new Error('PDFの生データが存在しません。');
        }

        const pageLabel =
          sortedPages.length === 1
            ? `p${sortedPages[0]}`
            : `p${sortedPages[0]}-${sortedPages[sortedPages.length - 1]}_${sortedPages.length}pages`;
        const suggestedName = `${baseName}_extracted_${pageLabel}.pdf`;

        setStatusMessage('選択ページを抽出して新規PDFを生成中...');
        const newPdfBytes = await extractPagesToNewPdf(sourcePdfBytes, sortedPages);

        setStatusMessage('保存ダイアログを開いています...');
        const saved = await saveFileWithPickerOrDownload(
          newPdfBytes,
          suggestedName,
          'application/pdf',
          '抽出したPDFドキュメント'
        );

        if (saved) {
          onClose();
        }
      } else {
        // PNG image export
        if (!pdfDoc) throw new Error('PDFドキュメントが読み込まれていません。');

        if (sortedPages.length === 1) {
          const pageNum = sortedPages[0];
          setStatusMessage(`ページ ${pageNum} を高解像度画像にレンダリング中...`);
          const blob = await exportPageAsImage(pdfDoc, pageNum, 2.0);
          const arrayBuf = await blob.arrayBuffer();

          const suggestedName = `${baseName}_page_${pageNum}.png`;
          const saved = await saveFileWithPickerOrDownload(
            new Uint8Array(arrayBuf),
            suggestedName,
            'image/png',
            'PNG画像'
          );

          if (saved) {
            onClose();
          }
        } else {
          // Multiple pages as PNG: save sequentially
          for (let i = 0; i < sortedPages.length; i++) {
            const pageNum = sortedPages[i];
            setStatusMessage(`画像保存中 (${i + 1}/${sortedPages.length}): ページ ${pageNum}`);
            const blob = await exportPageAsImage(pdfDoc, pageNum, 2.0);
            const arrayBuf = await blob.arrayBuffer();
            const suggestedName = `${baseName}_page_${pageNum}.png`;
            await saveFileWithPickerOrDownload(
              new Uint8Array(arrayBuf),
              suggestedName,
              'image/png',
              'PNG画像'
            );
          }
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Page export error:', err);
      alert(`保存中にエラーが発生しました: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const sortedSelected = [...selectedPages].sort((a, b) => a - b);

  return (
    <div
      id="page-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="page-export-modal-content"
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">
                指定ページの抽出・ワンクリック保存
              </h3>
              <p className="text-xs text-neutral-400">
                {documentName} (全 {totalPages} ページ中、
                <span className="text-emerald-400 font-semibold mx-1">
                  {selectedPages.length} ページ
                </span>
                選択中)
              </p>
            </div>
          </div>
          <button
            id="close-page-export-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              保存形式の選択
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  exportFormat === 'pdf'
                    ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    exportFormat === 'pdf'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    PDF形式 (.pdf)
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    選択したページのみで構成された新しいPDFファイルを作成
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('png')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  exportFormat === 'png'
                    ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    exportFormat === 'png'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    高画質画像 (.png)
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    2x解像度のPNG画像として各ページを出力・保存
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Selection Presets & Range Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300">
                ページの選択方法
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={handleSelectCurrentPageOnly}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px]"
                >
                  現在のページのみ ({currentPage}p)
                </button>
                <button
                  type="button"
                  onClick={onSelectAllPages}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px]"
                >
                  全選択
                </button>
                <button
                  type="button"
                  onClick={onClearPageSelection}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px]"
                >
                  全解除
                </button>
              </div>
            </div>

            {/* Range input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customRangeInput}
                onChange={(e) => setCustomRangeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyRangeInput()}
                placeholder="範囲指定 (例: 1, 3, 5-8)"
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleApplyRangeInput}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 hover:text-white transition-colors"
              >
                反映
              </button>
            </div>
          </div>

          {/* Visual Page Grid for Multi-selection */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span>ページをクリックして選択 / 解除</span>
              <span>
                選択中:{' '}
                <span className="text-emerald-400 font-mono">
                  {sortedSelected.length > 0 ? sortedSelected.join(', ') : 'なし'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-neutral-950 rounded-xl border border-neutral-800">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isSelected = selectedPages.includes(pageNum);
                const isCurrent = currentPage === pageNum;

                return (
                  <button
                    key={`export-page-grid-${pageNum}`}
                    type="button"
                    onClick={() => onTogglePageSelection(pageNum)}
                    className={`relative p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40 shadow-xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{pageNum}</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      {isCurrent ? '閲覧中' : `p.${pageNum}`}
                    </div>

                    {/* Check icon */}
                    <div className="absolute top-1 right-1">
                      {isSelected ? (
                        <CheckSquare className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Square className="w-3 h-3 text-neutral-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status notification */}
          {statusMessage && (
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 flex items-center gap-2 text-xs text-indigo-300">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            キャンセル
          </button>

          <button
            id="execute-page-export-btn"
            type="button"
            disabled={isProcessing || selectedPages.length === 0}
            onClick={handleExecuteSave}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderDown className="w-4 h-4" />
            )}
            <span>
              {selectedPages.length === 1
                ? `ページ ${selectedPages[0]} を指定場所に保存`
                : `選択した ${selectedPages.length} ページを指定場所に保存`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
