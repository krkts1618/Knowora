"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, Loader2, Trash2, FileX } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DeleteDocumentDialogProps {
  document: {
    id: string;
    title: string;
    sourceType: string;
    originalFileKey?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteDocumentDialog({
  document: doc,
  isOpen,
  onClose,
  onSuccess,
}: DeleteDocumentDialogProps) {
  const router = useRouter();
  const [strategy, setStrategy] = useState<"all" | "pdf_only">("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setError(null);
    setStrategy("all");
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

  if (!isOpen || !doc) return null;

  const isPdf = doc.sourceType === "pdf" || Boolean(doc.originalFileKey);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetch(`/api/documents/${doc.id}?strategy=${strategy}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete document");
      }

      handleClose();
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--status-error)]/10 text-[var(--status-error)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Delete &ldquo;{doc.title}&rdquo;?
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Choose an explicit deletion strategy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 py-2 text-xs text-[var(--text-secondary)]">
          <p className="leading-relaxed">
            Please select how you would like to handle this document and its associated records:
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Strategy 1: Complete Deletion */}
            <label
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                strategy === "all"
                  ? "border-[var(--status-error)] bg-[var(--status-error)]/5"
                  : "border-[var(--border)] bg-[var(--canvas)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <input
                type="radio"
                name="delete-strategy"
                value="all"
                checked={strategy === "all"}
                onChange={() => setStrategy("all")}
                className="mt-0.5 accent-[var(--status-error)]"
              />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-[var(--status-error)]" />
                  Option 1: Complete Deletion (Delete Everything)
                </span>
                <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Permanently deletes the document entity, all indexed topics, notes, snapshots, bookmarks, and recent-view references.
                </span>
              </div>
            </label>

            {/* Strategy 2: PDF Only (Only applicable if document has PDF source) */}
            {isPdf && (
              <label
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  strategy === "pdf_only"
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--canvas)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <input
                  type="radio"
                  name="delete-strategy"
                  value="pdf_only"
                  checked={strategy === "pdf_only"}
                  onChange={() => setStrategy("pdf_only")}
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileX className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Option 2: Delete Original PDF Only (Retain Study Notes)
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Removes the original PDF file reference from storage. Preserves the document metadata, note structure, and all extracted topics in your library.
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)] mt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl text-white transition-colors shadow-xs ${
              strategy === "all"
                ? "bg-[var(--status-error)] hover:bg-[var(--status-error)]/90"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isDeleting
                ? "Processing..."
                : strategy === "all"
                ? "Delete Everything"
                : "Delete PDF Only"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
