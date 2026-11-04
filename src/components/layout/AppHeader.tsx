"use client";

import React from "react";
import { Menu, Plus, FileText, Folder, Upload } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserMenu } from "@/components/ui/UserMenu";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export interface AppHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  onOpenMobileSidebar?: () => void;
  breadcrumbs?: React.ReactNode;
}

export function AppHeader({
  user,
  onOpenMobileSidebar,
  breadcrumbs,
}: AppHeaderProps) {
  const handleOpenCreateDocument = () => {
    window.dispatchEvent(new CustomEvent("open-create-document"));
  };

  const handleOpenCreateFolder = () => {
    window.dispatchEvent(new CustomEvent("open-create-folder"));
  };

  const handleOpenUploadPdf = () => {
    window.dispatchEvent(new CustomEvent("open-upload-pdf"));
  };

  const createMenuItems: DropdownMenuItem[] = [
    {
      label: "New Document",
      icon: <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />,
      onClick: handleOpenCreateDocument,
    },
    {
      label: "New Folder",
      icon: <Folder className="w-3.5 h-3.5 text-[var(--accent)]" />,
      onClick: handleOpenCreateFolder,
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Upload PDF",
      icon: <Upload className="w-3.5 h-3.5 text-[var(--text-muted)]" />,
      badge: "Phase 5",
      onClick: handleOpenUploadPdf,
    },
  ];

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile hamburger & optional Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {breadcrumbs && (
          <div className="hidden sm:flex items-center min-w-0 truncate">
            {breadcrumbs}
          </div>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <SearchInput />
      </div>

      {/* Right: Quick Create, Theme Toggle & User Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile Search Icon trigger */}
        <div className="sm:hidden">
          <SearchInput className="w-9 px-2 justify-center" placeholder="" />
        </div>

        {/* Create Dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-medium text-xs hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
              title="Create new note, document or folder"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">New</span>
            </button>
          }
          items={createMenuItems}
        />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Account Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
