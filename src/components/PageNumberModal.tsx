import React, { useState } from 'react';
import {
  PageNumberConfig,
  PageNumberPosition,
  PageNumberFormat,
} from '../types';
import {
  X,
  Hash,
  Download,
  Check,
  Eye,
  Settings2,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { formatPageNumberText } from '../utils/pdfPageNumberer';

interface PageNumberModalProps {
  isOpen: boolean;
  totalPages: number;
  documentName: string;
  onApplyToViewer: (config: PageNumberConfig) => Promise<void>;
  onDownload: (config: PageNumberConfig) => Promise<void>;
  onClose: () => void;
}

export const PageNumberModal: React.FC<PageNumberModalProps> = ({
  isOpen,
  totalPages,
  documentName,
  onApplyToViewer,
  onDownload,
  onClose,
}) => {
  const [config, setConfig] = useState<PageNumberConfig>({
    position: 'bottom-center',
    format: 'hyphens',
    startFromPage: 1,
    startingNumber: 1,
    skipFirstPage: false,
    fontSize: 10,
    fontColor: 'dark-gray',
    fontFamily: 'helvetica',
    margin: 25,
  });

  const [isApplying, setIsApplying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const positions: { id: PageNumberPosition; label: string; gridArea: string }[] = [
    { id: 'top-left', label: '左上', gridArea: 'col-start-1 row-start-1' },
    { id: 'top-center', label: '中央上', gridArea: 'col-start-2 row-start-1' },
    { id: 'top-right', label: '右上', gridArea: 'col-start-3 row-start-1' },
    { id: 'bottom-left', label: '左下', gridArea: 'col-start-1 row-start-3' },
    { id: 'bottom-center', label: '中央下', gridArea: 'col-start-2 row-start-3' },
    { id: 'bottom-right', label: '右下', gridArea: 'col-start-3 row-start-3' },
  ];

  const formats: { id: PageNumberFormat; label: string; example: string }[] = [
    { id: 'hyphens', label: 'ハイフン付き', example: '- 1 -' },
    { id: 'number-only', label: '数字のみ', example: '1' },
    { id: 'slash-total', label: '総ページ比', example: `1 / ${totalPages}` },
    { id: 'page-x-of-y', label: '英語表記', example: `Page 1 of ${totalPages}` },
    { id: 'p-number', label: 'プレフィックス', example: 'p. 1' },
    { id: 'brackets', label: '角括弧', example: '[ 1 ]' },
  ];

  // Preview sample text
  const previewText = formatPageNumberText(
    config.skipFirstPage ? 1 : 0,
    totalPages,
    config
  );

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await onApplyToViewer(config);
      onClose();
    } catch (e: any) {
      alert(`エラーが発生しました: ${e.message || e}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownload(config);
    } catch (e: any) {
      alert(`ダウンロード中にエラーが発生しました: ${e.message || e}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="page-number-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="page-number-modal-content"
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">
                PDFにページ番号（ノンブル）を付与
              </h3>
              <p className="text-xs text-neutral-400">
                {documentName} (全 {totalPages} ページ)
              </p>
            </div>
          </div>
          <button
            id="close-page-number-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main 2-column: Preview & Position */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Miniature Page Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
              <span className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                仕上がりプレビュー
              </span>

              <div
                id="mini-page-preview"
                className="w-44 h-60 bg-white rounded-md shadow-lg border border-neutral-300 relative p-3 flex flex-col justify-between select-none overflow-hidden"
              >
                {/* Simulated document layout header */}
                <div className="space-y-1.5 opacity-30">
                  <div className="h-2 bg-neutral-800 rounded-sm w-3/4" />
                  <div className="h-1 bg-neutral-400 rounded-sm w-full" />
                  <div className="h-1 bg-neutral-400 rounded-sm w-5/6" />
                </div>

                {/* Simulated document body lines */}
                <div className="space-y-1 opacity-20 my-auto">
                  <div className="h-1 bg-neutral-600 rounded-sm w-full" />
                  <div className="h-1 bg-neutral-600 rounded-sm w-11/12" />
                  <div className="h-1 bg-neutral-600 rounded-sm w-4/5" />
                  <div className="h-1 bg-neutral-600 rounded-sm w-full" />
                  <div className="h-1 bg-neutral-600 rounded-sm w-3/4" />
                </div>

                {/* Simulated page number placed according to configuration */}
                <div
                  className={`absolute transition-all duration-200 ${
                    config.position.startsWith('top') ? 'top-2' : 'bottom-2'
                  } ${
                    config.position.endsWith('left')
                      ? 'left-3'
                      : config.position.endsWith('right')
                      ? 'right-3'
                      : 'left-1/2 -translate-x-1/2'
                  }`}
                >
                  <span
                    className={`font-mono px-1 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      config.fontColor === 'indigo'
                        ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                        : config.fontColor === 'black'
                        ? 'text-neutral-950 bg-neutral-100 border border-neutral-300'
                        : config.fontColor === 'subtle-gray'
                        ? 'text-neutral-400 bg-neutral-50'
                        : 'text-neutral-700 bg-neutral-100'
                    }`}
                  >
                    {previewText}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] text-neutral-400">
                  {config.skipFirstPage
                    ? '※ 1ページ目（表紙）は除外されます'
                    : '※ 全ページに適用されます'}
                </span>
              </div>
            </div>

            {/* Right: Position & Format Configuration */}
            <div className="md:col-span-7 space-y-4">
              {/* Position selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  印字位置
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  {positions.map((pos) => {
                    const isSelected = config.position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, position: pos.id }))
                        }
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                        }`}
                      >
                        {pos.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number Format selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  表記フォーマット
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {formats.map((fmt) => {
                    const isSelected = config.format === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, format: fmt.id }))
                        }
                        className={`p-2 rounded-lg text-left border transition-all ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/40'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                        }`}
                      >
                        <div className="text-[10px] text-neutral-500">
                          {fmt.label}
                        </div>
                        <div className="text-xs font-mono font-medium text-neutral-200 mt-0.5">
                          {fmt.example}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover page and starting number */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200 select-none">
                  <input
                    type="checkbox"
                    checked={config.skipFirstPage}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setConfig((prev) => ({
                        ...prev,
                        skipFirstPage: checked,
                        startFromPage: checked ? Math.max(2, prev.startFromPage) : 1,
                      }));
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-neutral-900 border-neutral-700"
                  />
                  <span>表紙（1ページ目）を除外して2ページ目から振る</span>
                </label>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-850">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      開始ページ
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={config.startFromPage}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          startFromPage: Math.max(
                            1,
                            Math.min(totalPages, Number(e.target.value))
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      開始番号
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={config.startingNumber}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          startingNumber: Math.max(1, Number(e.target.value)),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced options accordion / details */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="grid grid-cols-3 gap-3">
              {/* Font size */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  文字サイズ
                </label>
                <select
                  value={config.fontSize}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      fontSize: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={8}>8 pt (極小)</option>
                  <option value={9}>9 pt (控えめ)</option>
                  <option value={10}>10 pt (標準)</option>
                  <option value={11}>11 pt (やや大)</option>
                  <option value={12}>12 pt (大)</option>
                  <option value={14}>14 pt (特大)</option>
                </select>
              </div>

              {/* Font color */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  文字色
                </label>
                <select
                  value={config.fontColor}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      fontColor: e.target.value as any,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="dark-gray">濃いグレー (推奨)</option>
                  <option value="black">ブラック</option>
                  <option value="subtle-gray">薄いグレー</option>
                  <option value="indigo">インディゴブルー</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  余白 (マージン)
                </label>
                <select
                  value={config.margin}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      margin: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={15}>15 pt (端寄り)</option>
                  <option value={25}>25 pt (標準)</option>
                  <option value={35}>35 pt (広め)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            閉じる
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Download Button */}
            <button
              id="download-numbered-pdf-btn"
              type="button"
              disabled={isDownloading || isApplying}
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-750 disabled:opacity-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{isDownloading ? '生成中...' : 'PDFをダウンロード'}</span>
            </button>

            {/* Apply Directly to Viewer Button */}
            <button
              id="apply-numbers-to-viewer-btn"
              type="button"
              disabled={isApplying || isDownloading}
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {isApplying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isApplying ? '適用中...' : 'ビューアに即時適用'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
