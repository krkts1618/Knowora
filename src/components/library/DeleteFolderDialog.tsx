"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DeleteFolderDialogProps {
  folder: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteFolderDialog({
  folder,
  isOpen,
  onClose,
  onSuccess,
}: DeleteFolderDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
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

  if (!isOpen || !folder) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete folder");
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
        className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--status-error)]/10 text-[var(--status-error)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Delete Folder &ldquo;{folder.name}&rdquo;?
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Confirm folder removal
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

        <div className="flex flex-col gap-3 py-2 text-xs text-[var(--text-secondary)]">
          <p className="leading-relaxed">
            Are you sure you want to delete <strong className="text-[var(--text-primary)] font-semibold">{folder.name}</strong>?
          </p>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 flex flex-col gap-2">
            <span className="font-semibold text-[var(--text-primary)] text-[11px] uppercase tracking-wider">
              Deletion Policy:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--text-muted)]">
              <li>
                All nested subfolders inside this folder will be deleted.
              </li>
              <li>
                Contained study documents will <strong className="text-[var(--text-primary)]">not</strong> be deleted; they will be safely retained in your Root Library.
              </li>
              <li>
                This operation is immediate and permanent.
              </li>
            </ul>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--status-error)] text-white hover:bg-[var(--status-error)]/90 transition-colors shadow-xs"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isDeleting ? "Deleting..." : "Delete Folder"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
