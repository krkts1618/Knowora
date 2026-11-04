'use client';

import React from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useKnowledge();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const Icon = 
          toast.type === 'success' ? CheckCircle2 :
          toast.type === 'info' ? Info :
          toast.type === 'warning' ? AlertTriangle : XCircle;

        const borderLeftClass = 
          toast.type === 'success' ? 'border-l-[var(--status-success)]' :
          toast.type === 'info' ? 'border-l-[var(--status-info)]' :
          toast.type === 'warning' ? 'border-l-[var(--status-warning)]' :
          'border-l-[var(--status-error)]';

        const iconColor = 
          toast.type === 'success' ? 'text-[var(--status-success)]' :
          toast.type === 'info' ? 'text-[var(--status-info)]' :
          toast.type === 'warning' ? 'text-[var(--status-warning)]' : 'text-[var(--status-error)]';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-md border border-[var(--border)] border-l-4 bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-modal)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderLeftClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs min-w-0">
              <p className="font-medium text-[var(--text-primary)]">{toast.message}</p>
              {toast.description && (
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
