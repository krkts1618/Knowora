"use client";

import React, { useState, useEffect } from "react";
import { History, X, RotateCcw, Loader2, AlertCircle, Calendar, Check, ArrowRight } from "lucide-react";

export interface TopicVersion {
  id: string;
  topicId: string;
  versionNumber: number;
  titleSnapshot: string;
  contentSnapshot: Record<string, unknown>;
  plainTextSnapshot: string;
  createdAt: string | Date;
}

export interface TopicVersionHistoryModalProps {
  isOpen: boolean;
  topicId: string;
  topicTitle: string;
  onClose: () => void;
  onRestored: () => void;
}

interface TopicVersionHistoryContentProps {
  topicId: string;
  topicTitle: string;
  onClose: () => void;
  onRestored: () => void;
}

function TopicVersionHistoryContent({
  topicId,
  topicTitle,
  onClose,
  onRestored,
}: TopicVersionHistoryContentProps) {
  const [versions, setVersions] = useState<TopicVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/topics/${topicId}/versions`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && Array.isArray(json.data)) {
          setVersions(json.data);
          if (json.data.length > 0) {
            setSelectedVersionId(json.data[0].id);
          }
        } else {
          setError(json.error?.message || "Failed to load versions");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load version history");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  const handleRestore = async (versionId: string) => {
    try {
      setIsRestoring(true);
      setError(null);
      const res = await fetch(`/api/topics/${topicId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to restore version");
      }

      setSuccessMessage("Version successfully restored! Current content was preserved as a new version.");
      setTimeout(() => {
        onRestored();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[85vh] max-h-[700px] rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Version History
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate max-w-md">
                {topicTitle}
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

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success)]/10 text-[var(--status-success)] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body: Split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Versions List */}
          <div className="w-72 border-r border-[var(--border)] bg-[var(--canvas)] flex flex-col">
            <div className="p-3 border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              <span>Saved Snapshots</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)]">
                {versions.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-xs text-[var(--text-muted)] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  <span>Loading history...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                  No previous versions recorded for this topic.
                </div>
              ) : (
                versions.map((ver, idx) => {
                  const isSelected = ver.id === selectedVersionId;
                  const isCurrent = idx === 0;

                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => setSelectedVersionId(ver.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "bg-[var(--surface)] border-[var(--accent)] shadow-xs"
                          : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--text-primary)]">
                          Version {ver.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--accent)] text-[var(--accent-foreground)]">
                            Current
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-[var(--text-secondary)] truncate">
                        {ver.titleSnapshot}
                      </span>

                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ver.createdAt).toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Version Content Preview */}
          <div className="flex-1 flex flex-col bg-[var(--surface)] overflow-hidden">
            {selectedVersion ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview Toolbar */}
                <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Snapshot Preview (v{selectedVersion.versionNumber})</span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)] font-normal">{selectedVersion.titleSnapshot}</span>
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Recorded on {new Date(selectedVersion.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isRestoring || versions[0]?.id === selectedVersion.id}
                    onClick={() => handleRestore(selectedVersion.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    title={versions[0]?.id === selectedVersion.id ? "Already active" : "Restore this version"}
                  >
                    {isRestoring ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Restore Version</span>
                  </button>
                </div>

                {/* Preview Plain Text / Content Summary */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    {selectedVersion.titleSnapshot}
                  </h2>

                  {selectedVersion.plainTextSnapshot ? (
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedVersion.plainTextSnapshot}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      This version snapshot has no plain text content.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-[var(--text-muted)]">
                Select a version on the left to preview its content.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopicVersionHistoryModal({
  isOpen,
  topicId,
  topicTitle,
  onClose,
  onRestored,
}: TopicVersionHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <TopicVersionHistoryContent
      key={topicId}
      topicId={topicId}
      topicTitle={topicTitle}
      onClose={onClose}
      onRestored={onRestored}
    />
  );
}
