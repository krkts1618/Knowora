"use client";

import React, { useEffect } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";

export interface PdfUploadComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PdfUploadComingSoonModal({
  isOpen,
  onClose,
}: PdfUploadComingSoonModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  PDF Extraction & Upload
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)] font-medium">
                  Phase 5 Roadmap
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Automated document parsing & indexing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 py-2 text-xs text-[var(--text-secondary)]">
          <p className="leading-relaxed">
            Per the NoteNest architecture plan, cloud storage, background queue processing, and automated PDF topic extraction are scheduled for Phase 5.
          </p>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 flex flex-col gap-2">
            <span className="font-semibold text-[var(--text-primary)] text-[11px] uppercase tracking-wider">
              Upcoming Capabilities
            </span>
            <div className="flex items-start gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <span>Multi-page PDF upload with page extraction & preview.</span>
            </div>
            <div className="flex items-start gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <span>AI-assisted draft generation and hierarchical topic splitting.</span>
            </div>
            <div className="flex items-start gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <span>Direct side-by-side note reading with original PDF page citations.</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] italic">
            You can currently create and organize documents and study topics manually via the dashboard or library.
          </p>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[var(--border)] mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
