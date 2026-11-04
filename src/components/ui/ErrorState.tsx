import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`p-6 rounded-2xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 text-left flex flex-col sm:flex-row items-start gap-4 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--status-error)]/10 text-[var(--status-error)] flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
          {title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        )}
      </div>
    </div>
  );
}
