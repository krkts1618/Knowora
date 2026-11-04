"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
  BookMarked,
  LayoutDashboard,
  Library,
  Clock,
  Bookmark,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";

export interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  user,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("notenest_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("notenest_sidebar_collapsed", String(next));
    } catch {}
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "My Library",
      href: "/library",
      icon: Library,
      active: pathname === "/library" || pathname.startsWith("/library/"),
    },
    {
      label: "Recent",
      href: "/dashboard?tab=recent",
      icon: Clock,
      active: false,
    },
    {
      label: "Bookmarks",
      href: "/dashboard?tab=bookmarks",
      icon: Bookmark,
      active: false,
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] text-[var(--text-secondary)] select-none text-xs transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group overflow-hidden"
          title="NoteNest Dashboard"
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <BookMarked className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                NoteNest
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Study Workspace
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace indicator */}
      {!isCollapsed && (
        <div className="px-3.5 py-2.5 border-b border-[var(--border)] shrink-0 bg-[var(--surface-muted)]/30">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Workspace
          </div>
          <div className="mt-0.5 text-xs font-medium text-[var(--text-primary)] truncate">
            Personal Knowledge Base
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {/* Search entry button */}
        <button
          type="button"
          onClick={openSearch}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors group ${
            isCollapsed ? "justify-center" : ""
          } text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]`}
          title="Search (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="truncate">Search</span>
              <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </div>
          )}
        </button>

        <div className="my-1 border-t border-[var(--border)] opacity-60" />

        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors font-medium ${
                isCollapsed ? "justify-center" : ""
              } ${
                item.active
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  item.active
                    ? "text-[var(--accent-foreground)]"
                    : "text-[var(--text-muted)]"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-1 border-t border-[var(--border)] opacity-60" />

        {/* Settings & Profile */}
        <Link
          href="/settings"
          onClick={() => onCloseMobile?.()}
          className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            pathname === "/settings"
              ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </Link>
      </div>

      {/* Footer Area: User, Theme & Logout */}
      <div className="p-2 border-t border-[var(--border)] shrink-0 flex flex-col gap-1.5 bg-[var(--surface)]/50">
        {/* Profile Card / Link */}
        <Link
          href="/profile"
          onClick={() => onCloseMobile?.()}
          className={`flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${pathname === "/profile" ? "bg-[var(--surface-muted)]" : ""}`}
          title="Profile Information"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-[11px] flex items-center justify-center shrink-0">
            {user?.name?.[0]?.toUpperCase() || "N"}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-xs text-[var(--text-primary)] truncate">
                {user?.name || "Scholar"}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                {user?.email || "user@notenest.local"}
              </span>
            </div>
          )}
        </Link>

        {/* Bottom controls: Theme toggle & Logout */}
        <div
          className={`flex items-center justify-between pt-1 border-t border-[var(--border)] text-xs ${
            isCollapsed ? "flex-col gap-1" : "px-1"
          }`}
        >
          {/* Theme Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1.5"
            title={`Theme: ${theme}`}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
            )}
            {!isCollapsed && (
              <span className="text-[11px] capitalize">{theme}</span>
            )}
          </button>

          {/* Logout button */}
          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="text-[11px]">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            className="w-64 h-full bg-[var(--sidebar)] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
