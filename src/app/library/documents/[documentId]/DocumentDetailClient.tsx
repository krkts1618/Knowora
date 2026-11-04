"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Folder,
  ArrowLeft,
  Pencil,
  FolderSymlink,
  Trash2,
  BookOpen,
  Home,
  ChevronRight,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { EditDocumentModal } from "@/components/library/EditDocumentModal";
import { MoveDocumentModal } from "@/components/library/MoveDocumentModal";
import { DeleteDocumentDialog } from "@/components/library/DeleteDocumentDialog";
import { FolderItem } from "@/components/library/MoveFolderModal";

export interface DocumentDetailData {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  sourceType: string;
  topicCount: number;
  originalFileName: string | null;
  fileSizeBytes: number;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicItem {
  id: string;
  title: string;
  plainText: string;
  position: number;
  origin: string;
  parentTopicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetailClientProps {
  document: DocumentDetailData;
  breadcrumbPath: Array<{ id: string; name: string }>;
  topics: TopicItem[];
  allFolders: FolderItem[];
}

export function DocumentDetailClient({
  document: doc,
  breadcrumbPath,
  topics,
  allFolders,
}: DocumentDetailClientProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDeleteSuccess = () => {
    router.push(doc.folderId ? `/library/folders/${doc.folderId}` : "/library");
    router.refresh();
  };

  const isPdf = doc.sourceType === "pdf";

  // Build folder name
  const folderName = allFolders.find((f) => f.id === doc.folderId)?.name;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumbs"
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
              className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
            >
              {node.name}
            </Link>
          </React.Fragment>
        ))}

        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
        <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
          {doc.title}
        </span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href={doc.folderId ? `/library/folders/${doc.folderId}` : "/library"}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shrink-0 mt-0.5"
            title="Back to parent"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] truncate">
                {doc.title}
              </h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider font-semibold ${
                  isPdf
                    ? "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--accent)]"
                    : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-secondary)]"
                }`}
              >
                {doc.sourceType}
              </span>
            </div>

            {folderName && (
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Stored in <strong className="font-medium text-[var(--text-primary)]">{folderName}</strong></span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMoveOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <FolderSymlink className="w-3.5 h-3.5" />
            <span>Move</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--status-error)]/30 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Document Overview Metadata Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Document Overview
        </h2>

        {doc.description ? (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {doc.description}
          </p>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">
            No description provided. Click &ldquo;Edit&rdquo; above to add an overview for this document.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)] text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Indexed Topics</span>
            <span className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              {topics.length}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Created</span>
            <span className="font-medium text-[var(--text-secondary)] font-mono text-[11px]">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Last Updated</span>
            <span className="font-medium text-[var(--text-secondary)] font-mono text-[11px]">
              {new Date(doc.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">Source Type</span>
            <span className="font-medium text-[var(--text-secondary)] capitalize">
              {doc.sourceType}
            </span>
          </div>
        </div>
      </div>

      {/* Indexed Topics Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Study Topics & Notes
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
              {topics.length}
            </span>
          </div>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No topics added yet"
            description="Topics and study notes will be indexed here for quick retrieval and review."
            className="my-4"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)] shrink-0">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">
                      {topic.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {topic.plainText && (
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {topic.plainText}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modals */}
      <EditDocumentModal
        document={doc}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleRefresh}
      />

      <MoveDocumentModal
        document={doc}
        allFolders={allFolders}
        isOpen={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        onSuccess={handleRefresh}
      />

      <DeleteDocumentDialog
        document={doc}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
