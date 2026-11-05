"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  History,
  Plus,
  BookOpen,
  Check,
  Loader2,
  AlertCircle,
  Save,
  Calendar,
  PanelRight,
  Split,
  Download,
  X,
} from "lucide-react";

import { TopicTree, TopicItemData } from "./TopicTree";
import { RichTextEditor } from "./RichTextEditor";
import { CreateTopicModal } from "./modals/CreateTopicModal";
import { RenameTopicModal } from "./modals/RenameTopicModal";
import { MoveTopicModal } from "./modals/MoveTopicModal";
import { DeleteTopicDialog } from "./modals/DeleteTopicDialog";
import { TopicVersionHistoryModal } from "./modals/TopicVersionHistoryModal";

export interface DocumentWorkspaceProps {
  document: {
    id: string;
    title: string;
    description: string | null;
    folderId: string | null;
    sourceType: string;
    updatedAt: string;
  };
  breadcrumbPath: Array<{ id: string; name: string }>;
  initialTopics: TopicItemData[];
  initialActiveTopicId?: string | null;
}

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface ActiveTopicEditorPaneProps {
  topic: TopicItemData;
  onTopicUpdated: (updatedTopic: TopicItemData) => void;
  onOpenCreateSubtopic: (parentId: string) => void;
  onOpenVersionHistory: () => void;
}

function ActiveTopicEditorPane({
  topic,
  onTopicUpdated,
  onOpenCreateSubtopic,
  onOpenVersionHistory,
}: ActiveTopicEditorPaneProps) {
  const [title, setTitle] = useState(topic.title);
  const [content, setContent] = useState<Record<string, unknown>>(topic.content || {});
  const [plainText, setPlainText] = useState<string>(topic.plainText || "");
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(topic.updatedAt);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveSeqRef = useRef<number>(0);
  const lastSavedDataRef = useRef<{ title: string; contentJson: string }>({
    title: topic.title,
    contentJson: JSON.stringify(topic.content || {}),
  });

  const executeSave = useCallback(
    async (titleToSave: string, contentToSave: Record<string, unknown>, textToSave: string) => {
      const currentSeq = ++saveSeqRef.current;
      setSaveStatus("saving");
      setSaveErrorMessage(null);

      try {
        const res = await fetch(`/api/topics/${topic.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleToSave.trim() || topic.title || "Untitled Topic",
            content: contentToSave || {},
            plainText: textToSave || "",
            createSnapshot: true,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to save topic");
        }

        if (currentSeq === saveSeqRef.current) {
          setSaveStatus("saved");
          const nowStr = new Date().toISOString();
          setLastSavedTimestamp(nowStr);
          lastSavedDataRef.current = {
            title: titleToSave,
            contentJson: JSON.stringify(contentToSave || {}),
          };

          onTopicUpdated({
            ...topic,
            title: titleToSave,
            content: contentToSave,
            plainText: textToSave,
            updatedAt: nowStr,
          });
        }
      } catch (err: unknown) {
        if (currentSeq === saveSeqRef.current) {
          setSaveStatus("error");
          setSaveErrorMessage(
            err instanceof Error ? err.message : "Failed to save changes"
          );
        }
      }
    },
    [topic, onTopicUpdated]
  );

  const triggerDebouncedSave = useCallback(
    (newTitle: string, newContent: Record<string, unknown>, newText: string) => {
      const isContentDiff =
        JSON.stringify(newContent || {}) !== lastSavedDataRef.current.contentJson;
      const isTitleDiff = newTitle.trim() !== lastSavedDataRef.current.title.trim();

      if (!isContentDiff && !isTitleDiff) {
        return;
      }

      setSaveStatus("unsaved");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        executeSave(newTitle, newContent, newText);
      }, 1500);
    },
    [executeSave]
  );

  const handleEditorChange = useCallback(
    (newContent: Record<string, unknown>, newPlainText: string) => {
      setContent(newContent);
      setPlainText(newPlainText);
      triggerDebouncedSave(title, newContent, newPlainText);
    },
    [title, triggerDebouncedSave]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerDebouncedSave(val, content, plainText);
  };

  const handleImmediateSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeSave(title, content, plainText);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 gap-4">
      {/* Right Panel Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)] shrink-0 bg-[var(--canvas)]">
        {/* Topic Title Editable Input */}
        <div className="flex-1 min-w-0 mr-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Topic Title..."
            className="w-full text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-[var(--text-muted)]"
          />
          <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)] font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Updated {new Date(lastSavedTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Status Indicator & Topic Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Autosave Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--surface)]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
                <span className="text-[var(--text-muted)]">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3 h-3 text-[var(--status-success)]" />
                <span className="text-[var(--status-success)]">Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--status-warning)] animate-pulse" />
                <span className="text-[var(--text-muted)]">Unsaved changes</span>
              </>
            )}
            {saveStatus === "error" && (
              <button
                type="button"
                onClick={handleImmediateSave}
                className="flex items-center gap-1 text-[var(--status-error)] hover:underline"
                title={saveErrorMessage || "Save failed, click to retry"}
              >
                <AlertCircle className="w-3 h-3" />
                <span>Save failed (Retry)</span>
              </button>
            )}
            {saveStatus === "idle" && (
              <>
                <Check className="w-3 h-3 text-[var(--text-muted)] opacity-50" />
                <span className="text-[var(--text-muted)]">Ready</span>
              </>
            )}
          </div>

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={handleImmediateSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-40"
            title="Save Immediately (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Version History Button */}
          <button
            type="button"
            onClick={onOpenVersionHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="View snapshot history and restore previous versions"
          >
            <History className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden md:inline">History</span>
          </button>

          {/* Add Subtopic Button */}
          <button
            type="button"
            onClick={() => onOpenCreateSubtopic(topic.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Add Nested Subtopic"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden md:inline">Subtopic</span>
          </button>
        </div>
      </div>

      {/* Tiptap Rich Text Editor */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <RichTextEditor
          initialContent={content}
          onChange={handleEditorChange}
          onSaveShortcut={handleImmediateSave}
        />
      </div>
    </div>
  );
}

export function DocumentWorkspaceClient({
  document: doc,
  breadcrumbPath,
  initialTopics,
  initialActiveTopicId = null,
}: DocumentWorkspaceProps) {
  const router = useRouter();

  // Topics state
  const [topics, setTopics] = useState<TopicItemData[]>(initialTopics);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(
    initialActiveTopicId || (initialTopics.length > 0 ? initialTopics[0].id : null)
  );

  const activeTopic = topics.find((t) => t.id === activeTopicId) || null;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [parentForNewTopic, setParentForNewTopic] = useState<string | null>(null);

  const [topicToRename, setTopicToRename] = useState<TopicItemData | null>(null);
  const [topicToMove, setTopicToMove] = useState<TopicItemData | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<TopicItemData | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const handleExportTopic = () => {
    if (!activeTopic) return;
    const blob = new Blob([activeTopic.plainText || activeTopic.title], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${activeTopic.title.replace(/\s+/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Topic selection & routing
  const handleSelectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    window.history.pushState(
      null,
      "",
      `/library/documents/${doc.id}/topics/${topicId}`
    );
  };

  const handleTopicUpdated = useCallback((updatedTopic: TopicItemData) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t))
    );
  }, []);

  // Topic creation success
  const handleCreateSuccess = (newTopicId: string) => {
    router.refresh();
    fetch(`/api/topics?documentId=${doc.id}&parentTopicId=`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTopics(json.data);
          handleSelectTopic(newTopicId);
        }
      })
      .catch(() => {
        router.refresh();
      });
  };

  // Topic deletion success
  const handleDeleteSuccess = () => {
    setTopics((prev) => prev.filter((t) => t.id !== topicToDelete?.id));
    if (activeTopicId === topicToDelete?.id) {
      const remaining = topics.filter((t) => t.id !== topicToDelete?.id);
      if (remaining.length > 0) {
        handleSelectTopic(remaining[0].id);
      } else {
        setActiveTopicId(null);
        window.history.pushState(null, "", `/library/documents/${doc.id}`);
      }
    }
    router.refresh();
  };

  // Topic reordering
  const handleReorder = async (topicId: string, newPosition: number) => {
    try {
      await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: newPosition,
          createSnapshot: false,
        }),
      });

      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, position: newPosition } : t))
      );
      router.refresh();
    } catch {
      // Revert silently on network failure
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] -m-6 sm:-m-8 overflow-hidden">
      {/* Top Workspace Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] text-xs shrink-0 select-none">
        {/* Dynamic Breadcrumbs */}
        <nav
          aria-label="Document Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors shrink-0"
            title="Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
          <Link
            href="/library"
            className="hover:text-[var(--text-primary)] transition-colors shrink-0 font-medium"
          >
            My Library
          </Link>

          {breadcrumbPath.map((node) => (
            <React.Fragment key={node.id}>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
              <Link
                href={`/library/folders/${node.id}`}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[140px]"
              >
                {node.name}
              </Link>
            </React.Fragment>
          ))}

          <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
            {doc.title}
          </span>

          {activeTopic && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
              <span className="text-[var(--accent)] font-medium truncate max-w-[180px]">
                {activeTopic.title}
              </span>
            </>
          )}
        </nav>

        {/* Right Action Controls (Export, PDF Reader, Reference Panel Toggle) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/library/documents/${doc.id}/reader`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Open Document in PDF Reader"
          >
            <Split className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">PDF Reader</span>
          </Link>

          <button
            type="button"
            onClick={handleExportTopic}
            disabled={!activeTopic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 transition-all shadow-xs cursor-pointer disabled:opacity-40"
            title="Export Topic Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`p-1.5 rounded-xl border border-[var(--border)] transition-colors cursor-pointer ${
              isRightPanelOpen
                ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"
                : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title={isRightPanelOpen ? "Hide Source Reference" : "Show Source Reference"}
          >
            <PanelRight className="w-4 h-4" />
          </button>

          <Link
            href={doc.folderId ? `/library/folders/${doc.folderId}` : "/library"}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 ml-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Link>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Topic Hierarchy & Tree Navigation */}
        <div className="w-72 lg:w-80 shrink-0 flex flex-col h-full bg-[var(--surface)]">
          <TopicTree
            topics={topics}
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
            onCreateTopic={(parentId) => {
              setParentForNewTopic(parentId || null);
              setIsCreateModalOpen(true);
            }}
            onRenameTopic={setTopicToRename}
            onMoveTopic={setTopicToMove}
            onDeleteTopic={setTopicToDelete}
            onReorderTopic={handleReorder}
          />
        </div>

        {/* CENTER PANEL: Topic Editor & Workspace */}
        <div className="flex-1 flex flex-col h-full bg-[var(--canvas)] overflow-hidden">
          {activeTopic ? (
            <ActiveTopicEditorPane
              key={activeTopic.id}
              topic={activeTopic}
              onTopicUpdated={handleTopicUpdated}
              onOpenCreateSubtopic={(parentId) => {
                setParentForNewTopic(parentId);
                setIsCreateModalOpen(true);
              }}
              onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            />
          ) : (
            /* Empty State when no topic is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)] gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {topics.length === 0 ? "No Topics in this Document" : "Select a Topic to Start Writing"}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {topics.length === 0
                    ? "Create structured study topics to write notes, formulas, code snippets, and diagrams."
                    : "Choose a topic from the left hierarchy panel or create a new section."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setParentForNewTopic(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs mt-2"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Create First Topic</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Source Reference & Related Topics (Matches Screen 3) */}
        {isRightPanelOpen && activeTopic && (
          <div className="hidden lg:flex w-72 xl:w-80 shrink-0 border-l border-[var(--border)] bg-[var(--sidebar)] p-4 flex flex-col gap-5 overflow-y-auto select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Source Reference
              </span>
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Source Reference Card */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/30">
                  Page 12
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[140px]">
                  {doc.title}.pdf
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;Spring Boot simplifies development by offering opinionated defaults and embedded servlet containers.&rdquo;
              </div>

              <Link
                href={`/library/documents/${doc.id}/reader`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-[var(--text-primary)] border border-[var(--border)] transition-colors"
              >
                <span>View in PDF</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Related Topics Section */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Related Topics
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {topics.length} items
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {topics.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTopic(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer group ${
                      t.id === activeTopicId
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40 font-semibold"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTopicModal
        documentId={doc.id}
        initialParentTopicId={parentForNewTopic}
        allTopics={topics}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setParentForNewTopic(null);
        }}
        onSuccess={handleCreateSuccess}
      />

      <RenameTopicModal
        topic={topicToRename}
        isOpen={Boolean(topicToRename)}
        onClose={() => setTopicToRename(null)}
        onSuccess={() => {
          setTopicToRename(null);
          router.refresh();
        }}
      />

      <MoveTopicModal
        topic={topicToMove}
        allTopics={topics}
        isOpen={Boolean(topicToMove)}
        onClose={() => setTopicToMove(null)}
        onSuccess={() => {
          setTopicToMove(null);
          router.refresh();
        }}
      />

      <DeleteTopicDialog
        topic={topicToDelete}
        isOpen={Boolean(topicToDelete)}
        onClose={() => setTopicToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />

      {activeTopic && (
        <TopicVersionHistoryModal
          isOpen={isVersionHistoryOpen}
          topicId={activeTopic.id}
          topicTitle={activeTopic.title}
          onClose={() => setIsVersionHistoryOpen(false)}
          onRestored={() => {
            router.refresh();
            fetch(`/api/topics/${activeTopic.id}`)
              .then((res) => res.json())
              .then((json) => {
                if (json.success && json.data) {
                  handleTopicUpdated({
                    id: json.data.id,
                    title: json.data.title,
                    documentId: json.data.documentId,
                    parentTopicId: json.data.parentTopicId,
                    position: json.data.position,
                    plainText: json.data.plainText,
                    content: json.data.content,
                    createdAt: json.data.createdAt,
                    updatedAt: json.data.updatedAt,
                  });
                }
              });
          }}
        />
      )}
    </div>
  );
}
