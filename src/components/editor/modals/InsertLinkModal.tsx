"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link2, X, AlertCircle } from "lucide-react";

export interface InsertLinkModalProps {
  isOpen: boolean;
  initialUrl?: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

interface InsertLinkContentProps {
  initialUrl: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

function InsertLinkContent({
  initialUrl,
  onClose,
  onSubmit,
}: InsertLinkContentProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a valid URL.");
      return;
    }

    // Ensure protocol
    let formatted = trimmed;
    if (!/^https?:\/\//i.test(formatted) && !/^mailto:/i.test(formatted)) {
      formatted = `https://${formatted}`;
    }

    onSubmit(formatted);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-5 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">
              Insert Link
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Destination URL
            </label>
            <input
              type="text"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)] mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              Apply Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InsertLinkModal({
  isOpen,
  initialUrl = "",
  onClose,
  onSubmit,
}: InsertLinkModalProps) {
  if (!isOpen) return null;

  return (
    <InsertLinkContent
      key={initialUrl || "new-link"}
      initialUrl={initialUrl}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
