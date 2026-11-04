"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Folder, X, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CreateFolderModalProps {
  initialParentFolderId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CreateFolderModalContentProps {
  initialParentFolderId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function CreateFolderModalContent({
  initialParentFolderId,
  onClose,
  onSuccess,
}: CreateFolderModalContentProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string>(
    initialParentFolderId || ""
  );
  const [foldersList, setFoldersList] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setName("");
    setParentFolderId("");
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/folders")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setFoldersList(json.data);
        }
      })
      .catch(() => {
        // Silently handle if list fails
      })
      .finally(() => {
        if (isMounted) setIsLoadingFolders(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a folder name.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          parentFolderId: parentFolderId ? parentFolderId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create folder");
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
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Create New Folder
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Organize your study documents and notes
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
              Folder Name <span className="text-[var(--status-error)]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science, Machine Learning"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Parent Folder (Optional)
            </label>
            <select
              value={parentFolderId}
              onChange={(e) => setParentFolderId(e.target.value)}
              disabled={isLoadingFolders}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
            >
              <option value="">None (Top-level folder)</option>
              {foldersList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Folders can be nested infinitely.
            </p>
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
              disabled={isSubmitting || !name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Creating..." : "Create Folder"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateFolderModal({
  initialParentFolderId,
  isOpen,
  onClose,
  onSuccess,
}: CreateFolderModalProps) {
  if (!isOpen) return null;

  return (
    <CreateFolderModalContent
      key={initialParentFolderId || "root"}
      initialParentFolderId={initialParentFolderId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
