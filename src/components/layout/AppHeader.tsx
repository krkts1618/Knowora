"use client";

import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserMenu } from "@/components/ui/UserMenu";
import { NotificationModal } from "@/components/ui/NotificationModal";

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-4 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none cursor-pointer"
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
        <SearchInput placeholder="Search notes, topics, code..." />
      </div>

      {/* Right Controls: Theme Toggle, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Icon */}
        <div className="sm:hidden">
          <SearchInput className="w-9 px-2 justify-center" placeholder="" />
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle variant="cycle" />

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]" />
        </button>

        {/* User Account Menu */}
        <UserMenu user={user} />
      </div>

      {/* Notification Modal Drawer */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
}
