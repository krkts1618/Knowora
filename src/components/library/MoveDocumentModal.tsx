"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderSymlink, X, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FolderItem } from "./MoveFolderModal";

export interface MoveDocumentModalProps {
  document: {
    id: string;
    title: string;
    folderId?: string | null;
  } | null;
  allFolders: FolderItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MoveDocumentModalContentProps {
  document: {
    id: string;
    title: string;
    folderId?: string | null;
  };
  allFolders: FolderItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

function MoveDocumentModalContent({
  document: doc,
  allFolders,
  onClose,
  onSuccess,
}: MoveDocumentModalContentProps) {
  const router = useRouter();
  const [targetFolderId, setTargetFolderId] = useState<string>(doc.folderId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const destination = targetFolderId ? targetFolderId : null;
    if (destination === doc.folderId) {
      handleClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: destination }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to move document");
      }

      handleClose();
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <FolderSymlink className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Move Document
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate max-w-[240px]">
                {doc.title}
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
          <div className="mb-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Select Destination Folder
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="">Root Library (Top Level)</option>
              {allFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)] mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Moving..." : "Move Document"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MoveDocumentModal({
  document: doc,
  allFolders,
  isOpen,
  onClose,
  onSuccess,
}: MoveDocumentModalProps) {
  if (!isOpen || !doc) return null;

  return (
    <MoveDocumentModalContent
      key={doc.id}
      document={doc}
      allFolders={allFolders}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
