"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  BookOpen,
  Folder,
  Tag,
  Loader2,
  ArrowRight,
  Plus,
  Settings,
  User,
  Home,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  type: "document" | "topic" | "folder" | "tag" | "action";
  title: string;
  subtitle?: string;
  url?: string;
  action?: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    setIsLoading(false);
  }, []);

  // Global Ctrl+K / Cmd+K and custom event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
            return false;
          }
          return true;
        });
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    let isCurrent = true;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();

        if (!isCurrent) return;

        if (json.success && json.data) {
          const items: SearchResultItem[] = [];

          // Documents
          if (Array.isArray(json.data.documents)) {
            for (const doc of json.data.documents) {
              items.push({
                id: `doc-${doc.id}`,
                type: "document",
                title: doc.title,
                subtitle: doc.description || "Document",
                url: `/library/documents/${doc.id}`,
              });
            }
          }

          // Topics
          if (Array.isArray(json.data.topics)) {
            for (const top of json.data.topics) {
              items.push({
                id: `top-${top.id}`,
                type: "topic",
                title: top.title,
                subtitle: top.plainText?.slice(0, 70) || "Study topic",
                url: `/library/documents/${top.documentId}`,
              });
            }
          }

          // Folders
          if (Array.isArray(json.data.folders)) {
            for (const fol of json.data.folders) {
              items.push({
                id: `fol-${fol.id}`,
                type: "folder",
                title: fol.name,
                subtitle: "Folder collection",
                url: `/library/folders/${fol.id}`,
              });
            }
          }

          // Tags
          if (Array.isArray(json.data.tags)) {
            for (const tag of json.data.tags) {
              items.push({
                id: `tag-${tag.id}`,
                type: "tag",
                title: `#${tag.name}`,
                subtitle: "Tag filter",
                url: `/library?tag=${tag.name}`,
              });
            }
          }

          setResults(items);
          setSelectedIndex(0);
        }
      } catch {
        if (isCurrent) setResults([]);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  // Default Quick Actions when query is empty
  const defaultActions: SearchResultItem[] = [
    {
      id: "act-dashboard",
      type: "action",
      title: "Go to Dashboard",
      subtitle: "Overview of your workspace & stats",
      url: "/dashboard",
    },
    {
      id: "act-library",
      type: "action",
      title: "Open My Library",
      subtitle: "Browse all folders, notes & topics",
      url: "/library",
    },
    {
      id: "act-new-doc",
      type: "action",
      title: "Create Document",
      subtitle: "Add a new document to library",
      action: () => {
        window.dispatchEvent(new CustomEvent("open-create-document"));
      },
    },
    {
      id: "act-new-folder",
      type: "action",
      title: "Create Folder",
      subtitle: "Organize notes into a new folder",
      action: () => {
        window.dispatchEvent(new CustomEvent("open-create-folder"));
      },
    },
    {
      id: "act-profile",
      type: "action",
      title: "Profile Information",
      subtitle: "Manage your name and account details",
      url: "/profile",
    },
    {
      id: "act-settings",
      type: "action",
      title: "Workspace Settings",
      subtitle: "Editor and appearance preferences",
      url: "/settings",
    },
  ];

  const currentItems = query.trim() ? results : defaultActions;

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      handleClose();
      if (item.action) {
        item.action();
      } else if (item.url) {
        router.push(item.url);
      }
    },
    [router, handleClose]
  );

  // Arrow key navigation
  const handleNavKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < currentItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : currentItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentItems[selectedIndex]) {
        handleSelect(currentItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleNavKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) {
                setResults([]);
                setSelectedIndex(0);
              }
            }}
            placeholder="Type a command or search notes, topics, documents..."
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />

          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)] shrink-0" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSelectedIndex(0);
              }}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results / Suggestions List */}
        <div className="max-h-80 overflow-y-auto p-2 text-xs">
          {query.trim() && currentItems.length === 0 && !isLoading && (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!query.trim() && (
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Quick Navigation & Commands
            </div>
          )}

          {query.trim() && currentItems.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Search Results ({currentItems.length})
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            {currentItems.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--surface-muted)] text-[var(--accent)]"
                      }`}
                    >
                      {item.type === "document" && <FileText className="w-3.5 h-3.5" />}
                      {item.type === "topic" && <BookOpen className="w-3.5 h-3.5" />}
                      {item.type === "folder" && <Folder className="w-3.5 h-3.5" />}
                      {item.type === "tag" && <Tag className="w-3.5 h-3.5" />}
                      {item.type === "action" && (
                        item.id.includes("dashboard") ? <Home className="w-3.5 h-3.5" /> :
                        item.id.includes("library") ? <BookOpen className="w-3.5 h-3.5" /> :
                        item.id.includes("new") ? <Plus className="w-3.5 h-3.5" /> :
                        item.id.includes("profile") ? <User className="w-3.5 h-3.5" /> :
                        <Settings className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 truncate">
                      <span
                        className={`font-medium truncate ${
                          isSelected ? "text-white" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span
                          className={`text-[11px] truncate ${
                            isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ml-2 transition-transform ${
                      isSelected
                        ? "translate-x-0.5 text-white"
                        : "opacity-0 text-[var(--text-muted)]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-[var(--surface-muted)]/50 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] mr-1">↑</kbd>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] mr-1">↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] mr-1">↵</kbd>
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] mr-1">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
