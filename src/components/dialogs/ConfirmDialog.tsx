'use client';

import React from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = useKnowledge();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const { title, message, confirmLabel, danger, onConfirm } = confirmDialog;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeConfirm}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex items-start gap-3">
          <div className={`p-2 rounded-md shrink-0 ${danger ? 'bg-rose-500/10 text-[var(--status-error)]' : 'bg-amber-500/10 text-[var(--status-warning)]'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{message}</p>
          </div>
          <button
            onClick={closeConfirm}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2.5 bg-[var(--surface-muted)] border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            onClick={closeConfirm}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              closeConfirm();
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition shadow-xs ${
              danger
                ? 'bg-[var(--status-error)] hover:opacity-90 text-white'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)]'
            }`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
