"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ImageIcon, X, AlertCircle, Info } from "lucide-react";

export interface InsertImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    src: string;
    alt?: string;
    caption?: string;
    alignment?: "left" | "center" | "right";
  }) => void;
}

export function InsertImageModal({
  isOpen,
  onClose,
  onSubmit,
}: InsertImageModalProps) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setSrc("");
    setAlt("");
    setCaption("");
    setAlignment("center");
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = src.trim();
    if (!trimmed) {
      setError("Please enter a valid image URL.");
      return;
    }

    if (trimmed.startsWith("data:")) {
      setError("Base64 data URLs are restricted to preserve database performance. Please use an HTTPS image URL or asset link.");
      return;
    }

    let formatted = trimmed;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }

    onSubmit({
      src: formatted,
      alt: alt.trim() || undefined,
      caption: caption.trim() || undefined,
      alignment,
    });

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Insert Image
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Add an asset or web diagram to your study notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 2 Storage Notice */}
        <div className="mb-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] text-xs flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <span>
            <strong>Cloudflare R2 Direct Uploads</strong> will be enabled in Phase 2 / Prompt 7. Currently, you can link any secure HTTPS image asset URL.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Image Asset URL <span className="text-[var(--status-error)]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://images.unsplash.com/... or hosted diagram URL"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Alt Text (Accessibility)
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Diagram description..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Alignment
              </label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value as "left" | "center" | "right")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: B-Tree balancing mechanism"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)] mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!src.trim()}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
