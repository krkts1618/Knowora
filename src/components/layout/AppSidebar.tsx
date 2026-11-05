"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
  Home,
  BookOpen,
  Clock,
  Bookmark,
  Tag,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Folder,
  X,
  FileText,
  Upload,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { NoteNestLogo } from "@/components/ui/NoteNestLogo";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

export interface AppSidebarProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface CollectionFolder {
  id: string;
  name: string;
  documentCount?: number;
}

export function AppSidebar({
  user,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("notenest_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [collections, setCollections] = useState<CollectionFolder[]>([]);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  // Fetch top-level collections (folders)
  useEffect(() => {
    let isMounted = true;
    const fetchCollections = async () => {
      try {
        const res = await fetch("/api/folders");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setCollections(json.data.slice(0, 8));
        }
      } catch {
        // Fallback or offline
      }
    };

    fetchCollections();

    const handleRefresh = () => fetchCollections();
    window.addEventListener("refresh-folders", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("refresh-folders", handleRefresh);
    };
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("notenest_sidebar_collapsed", String(next));
    } catch {}
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
    if (onCloseMobile) onCloseMobile();
  };

  const openCreateDocument = () => {
    window.dispatchEvent(new CustomEvent("open-create-document"));
    setIsNewMenuOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const openCreateFolder = () => {
    window.dispatchEvent(new CustomEvent("open-create-folder"));
    setIsNewMenuOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const openUploadPdf = () => {
    window.dispatchEvent(new CustomEvent("open-upload-pdf"));
    setIsNewMenuOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  // Compute initials
  const userName = user?.name || "Scholar";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "NN";

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard" && !currentTab,
    },
    {
      label: "My Library",
      href: "/library",
      icon: BookOpen,
      active: pathname === "/library" || pathname.startsWith("/library/"),
    },
    {
      label: "Recent",
      href: "/dashboard?tab=recent",
      icon: Clock,
      active: pathname === "/dashboard" && currentTab === "recent",
    },
    {
      label: "Bookmarks",
      href: "/dashboard?tab=bookmarks",
      icon: Bookmark,
      active: pathname === "/dashboard" && currentTab === "bookmarks",
    },
    {
      label: "Tags",
      href: "/dashboard?tab=tags",
      icon: Tag,
      active: pathname === "/dashboard" && currentTab === "tags",
    },
    {
      label: "Search",
      onClick: openSearch,
      icon: Search,
      active: false,
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] text-[var(--text-secondary)] select-none text-xs transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <NoteNestLogo size="md" showText={!isCollapsed} />

        {/* Collapse toggle (desktop) */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden md:flex p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile close */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Prominent Action Button: + New */}
      <div className="p-3 shrink-0 relative">
        <button
          type="button"
          onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
          className={`w-full h-10 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer ${
            isCollapsed ? "px-0" : "px-4"
          }`}
          title="Create New Document or Folder"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {!isCollapsed && <span className="text-xs tracking-wide">New</span>}
        </button>

        {/* Floating New Dropdown */}
        {isNewMenuOpen && (
          <div className="absolute left-3 right-3 top-14 z-50 p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={openCreateDocument}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Create Document</span>
            </button>
            <button
              type="button"
              onClick={openCreateFolder}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Folder className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>New Folder</span>
            </button>
            <button
              type="button"
              onClick={openUploadPdf}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Upload PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClasses = item.active
            ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]";

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isCollapsed ? "justify-center" : ""
                } ${activeClasses}`}
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
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              onClick={() => onCloseMobile?.()}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                isCollapsed ? "justify-center" : ""
              } ${activeClasses}`}
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

        {/* COLLECTIONS Section */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                Collections
              </span>
              <button
                type="button"
                onClick={openCreateFolder}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                title="New Collection"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {collections.length > 0 ? (
                collections.map((col) => {
                  const isActive = pathname === `/library/folders/${col.id}`;
                  return (
                    <Link
                      key={col.id}
                      href={`/library/folders/${col.id}`}
                      onClick={() => onCloseMobile?.()}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="truncate">{col.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] shrink-0">
                        {col.documentCount ?? 0}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-[11px] text-[var(--text-muted)] italic">
                  No collections yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[var(--surface)]/40">
        <DropdownMenu
          align="left"
          trigger={
            <button
              type="button"
              className={`w-full flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={`${userName} (${user?.email || "Student"})`}
            >
              {/* User Avatar Circle */}
              <div className="w-9 h-9 rounded-full bg-[var(--accent)]/15 border-2 border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0">
                {userInitials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                      {userName}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate">
                      Student
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                </div>
              )}
            </button>
          }
          items={[
            {
              label: "Settings",
              icon: <Settings className="w-3.5 h-3.5" />,
              onClick: () => router.push("/settings"),
            },
            {
              divider: true,
              label: "",
            },
            {
              label: "Sign out",
              icon: <LogOut className="w-3.5 h-3.5" />,
              danger: true,
              onClick: handleSignOut,
            },
          ]}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 h-full">{sidebarContent}</aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full flex animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
