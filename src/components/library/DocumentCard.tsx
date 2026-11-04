"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  MoreVertical,
  Pencil,
  FolderSymlink,
  Trash2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export interface DocumentCardData {
  id: string;
  title: string;
  description?: string | null;
  folderId?: string | null;
  sourceType: string;
  topicCount?: number;
  originalFileName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DocumentCardProps {
  document: DocumentCardData;
  folderName?: string;
  viewMode: "grid" | "list";
  onEdit: (doc: DocumentCardData) => void;
  onMove: (doc: DocumentCardData) => void;
  onDelete: (doc: DocumentCardData) => void;
}

export function DocumentCard({
  document: doc,
  folderName,
  viewMode,
  onEdit,
  onMove,
  onDelete,
}: DocumentCardProps) {
  const router = useRouter();

  const menuItems: DropdownMenuItem[] = [
    {
      label: "Open Document",
      icon: <ExternalLink className="w-3.5 h-3.5" />,
      onClick: () => {
        router.push(`/library/documents/${doc.id}`);
      },
    },
    {
      label: "Edit Details",
      icon: <Pencil className="w-3.5 h-3.5" />,
      onClick: () => onEdit(doc),
    },
    {
      label: "Move",
      icon: <FolderSymlink className="w-3.5 h-3.5" />,
      onClick: () => onMove(doc),
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      danger: true,
      onClick: () => onDelete(doc),
    },
  ];

  const topicCount = doc.topicCount ?? 0;
  const isPdf = doc.sourceType === "pdf";

  if (viewMode === "list") {
    return (
      <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-center justify-between gap-3 group">
        <Link
          href={`/library/documents/${doc.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                {doc.title}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wide ${
                  isPdf
                    ? "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--accent)]"
                    : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-secondary)]"
                }`}
              >
                {doc.sourceType}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] truncate">
              {doc.description ? (
                <span className="truncate max-w-md">{doc.description}</span>
              ) : (
                <span>No description</span>
              )}
              {folderName && (
                <>
                  <span>•</span>
                  <span>in {folderName}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
            <BookOpen className="w-3 h-3 text-[var(--accent)]" />
            <span>{topicCount} {topicCount === 1 ? "topic" : "topics"}</span>
          </div>

          <span className="text-[10px] text-[var(--text-muted)] font-mono hidden md:inline">
            Updated {new Date(doc.updatedAt).toLocaleDateString()}
          </span>

          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
                title="Document options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-3 group relative">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/library/documents/${doc.id}`}
          className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
        >
          <FileText className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wide ${
              isPdf
                ? "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--accent)] font-medium"
                : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            {doc.sourceType}
          </span>

          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Document options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>

      <Link href={`/library/documents/${doc.id}`} className="flex flex-col gap-1 min-w-0">
        <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
          {doc.title}
        </h4>
        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed min-h-[32px]">
          {doc.description || "Manual document with study topics and notes."}
        </p>
      </Link>

      <div className="pt-2 border-t border-[var(--border)]/70 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
          <BookOpen className="w-3 h-3 text-[var(--accent)]" />
          <span>{topicCount} {topicCount === 1 ? "topic" : "topics"}</span>
        </div>
        <span className="font-mono">{new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
