import React, { useState, useEffect } from 'react';
import { TocItem } from '../types';
import { X, Check } from 'lucide-react';

interface TocEditModalProps {
  isOpen: boolean;
  item: TocItem | null;
  totalPages: number;
  onSave: (item: Partial<TocItem>) => void;
  onClose: () => void;
}

export const TocEditModal: React.FC<TocEditModalProps> = ({
  isOpen,
  item,
  totalPages,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setPageNumber(item.pageNumber);
      setLevel(item.level);
    } else {
      setTitle('');
      setPageNumber(1);
      setLevel(1);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      ...(item ? { id: item.id } : {}),
      title: title.trim(),
      pageNumber: Math.max(1, Math.min(totalPages, Number(pageNumber))),
      level: Number(level),
    });
    onClose();
  };

  return (
    <div
      id="toc-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="toc-modal-content"
        className="w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-100">
            {item ? '目次項目の編集' : '目次項目の追加'}
          </h3>
          <button
            id="close-toc-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              見出し・セクション名
            </label>
            <input
              id="toc-item-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第1章 システム設計"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                開始ページ (1〜{totalPages})
              </label>
              <input
                id="toc-item-page-input"
                type="number"
                min={1}
                max={totalPages}
                required
                value={pageNumber}
                onChange={(e) => setPageNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                見出しレベル
              </label>
              <select
                id="toc-item-level-select"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>大見出し (H1 / 章)</option>
                <option value={2}>中見出し (H2 / 節)</option>
                <option value={3}>小見出し (H3 / 項)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              id="cancel-toc-item-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              id="save-toc-item-btn"
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
