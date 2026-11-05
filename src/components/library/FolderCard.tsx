"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Folder,
  MoreVertical,
  Pencil,
  FolderSymlink,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export interface FolderCardData {
  id: string;
  name: string;
  parentFolderId?: string | null;
  documentCount?: number;
  subfolderCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FolderCardProps {
  folder: FolderCardData;
  viewMode: "grid" | "list";
  onRename: (folder: FolderCardData) => void;
  onMove: (folder: FolderCardData) => void;
  onDelete: (folder: FolderCardData) => void;
  onCreateSubfolder: (folder: FolderCardData) => void;
}

export function FolderCard({
  folder,
  viewMode,
  onRename,
  onMove,
  onDelete,
  onCreateSubfolder,
}: FolderCardProps) {
  const router = useRouter();

  const menuItems: DropdownMenuItem[] = [
    {
      label: "Open Folder",
      icon: <ExternalLink className="w-3.5 h-3.5" />,
      onClick: () => {
        router.push(`/library/folders/${folder.id}`);
      },
    },
    {
      label: "New Subfolder",
      icon: <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />,
      onClick: () => onCreateSubfolder(folder),
    },
    {
      label: "Rename",
      icon: <Pencil className="w-3.5 h-3.5" />,
      onClick: () => onRename(folder),
    },
    {
      label: "Move",
      icon: <FolderSymlink className="w-3.5 h-3.5" />,
      onClick: () => onMove(folder),
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      danger: true,
      onClick: () => onDelete(folder),
    },
  ];

  const docCount = folder.documentCount ?? 0;
  const subCount = folder.subfolderCount ?? 0;

  if (viewMode === "list") {
    return (
      <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-center justify-between gap-3 group">
        <Link
          href={`/library/folders/${folder.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Folder className="w-4 h-4 fill-[var(--accent)]/15" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
              {folder.name}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <span>{subCount} {subCount === 1 ? "subfolder" : "subfolders"}</span>
              <span>•</span>
              <span>{docCount} {docCount === 1 ? "document" : "documents"}</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">
            Updated {new Date(folder.updatedAt).toLocaleDateString()}
          </span>

          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
                title="Folder options"
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
  const totalItems = docCount + subCount;

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] hover:border-[var(--accent)] hover:shadow-md transition-all flex flex-col justify-between gap-4 group relative">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/library/folders/${folder.id}`}
          className="w-12 h-12 rounded-2xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
        >
          <Folder className="w-6 h-6 fill-[var(--accent)]/20 text-[var(--accent)]" />
        </Link>

        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title="Folder options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          }
          items={menuItems}
        />
      </div>

      <Link href={`/library/folders/${folder.id}`} className="flex flex-col gap-0.5 min-w-0">
        <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
          {folder.name}
        </h4>
        <span className="text-xs text-[var(--text-muted)]">
          {totalItems === 1 ? "1 Item" : `${totalItems} Items`}
        </span>
      </Link>
    </div>
  );
}
