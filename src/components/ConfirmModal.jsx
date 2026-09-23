import React, { useEffect } from 'react';

/**
 * 確認モーダルコンポーネント
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - モーダルの表示状態
 * @param {string} props.title - モーダルのタイトル
 * @param {string} props.message - モーダル本文のメッセージ
 * @param {string} [props.confirmText='やり直す'] - 確定ボタンのラベル
 * @param {string} [props.cancelText='キャンセル'] - キャンセルボタンのラベル
 * @param {() => void} props.onConfirm - 確定時のコールバック関数
 * @param {() => void} props.onCancel - キャンセル時のコールバック関数
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'やり直す',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
}) => {
  // Escキーが押下された場合にモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="text-xl font-bold text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
