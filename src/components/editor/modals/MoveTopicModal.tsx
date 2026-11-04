"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderSymlink, X, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface TopicItem {
  id: string;
  title: string;
  parentTopicId?: string | null;
}

export interface MoveTopicModalProps {
  topic: TopicItem | null;
  allTopics: TopicItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MoveTopicContentProps {
  topic: TopicItem;
  allTopics: TopicItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

function MoveTopicContent({
  topic,
  allTopics,
  onClose,
  onSuccess,
}: MoveTopicContentProps) {
  const router = useRouter();
  const [targetParentId, setTargetParentId] = useState<string>(
    topic.parentTopicId || ""
  );
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

  // Compute invalid destination IDs: topic itself and all descendants to prevent circular hierarchy
  const getDescendantIds = (rootId: string, list: TopicItem[]): Set<string> => {
    const invalid = new Set<string>([rootId]);
    let added = true;
    while (added) {
      added = false;
      for (const t of list) {
        if (t.parentTopicId && invalid.has(t.parentTopicId) && !invalid.has(t.id)) {
          invalid.add(t.id);
          added = true;
        }
      }
    }
    return invalid;
  };

  const invalidTargetIds = getDescendantIds(topic.id, allTopics);
  const validTargetTopics = allTopics.filter((t) => !invalidTargetIds.has(t.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const destination = targetParentId ? targetParentId : null;
    if (destination === topic.parentTopicId) {
      handleClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentTopicId: destination,
          createSnapshot: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to move topic");
      }

      handleClose();
      onSuccess?.();
      router.refresh();
    } catch (err: unknown) {
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
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <FolderSymlink className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Move Topic
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate max-w-[240px]">
                {topic.title}
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

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Select Parent Topic Destination
            </label>
            <select
              value={targetParentId}
              onChange={(e) => setTargetParentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <option value="">Top-Level Topic (Root of document)</option>
              {validTargetTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  📄 {t.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Descendant subtopics and self are safely excluded to prevent circular hierarchy loops.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)] mt-1">
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
              <span>{isSubmitting ? "Moving..." : "Move Topic"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MoveTopicModal({
  topic,
  allTopics,
  isOpen,
  onClose,
  onSuccess,
}: MoveTopicModalProps) {
  if (!isOpen || !topic) return null;

  return (
    <MoveTopicContent
      key={topic.id}
      topic={topic}
      allTopics={allTopics}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
