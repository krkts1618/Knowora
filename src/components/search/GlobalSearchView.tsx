"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  FileText,
  BookOpen,
  Folder,
  Lightbulb,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  type: "document" | "topic" | "folder";
  title: string;
  snippet?: string;
  breadcrumb?: string;
  timestamp?: string;
  url: string;
}

export function GlobalSearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "documents" | "topics" | "folders">("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
        if (isCurrent && json.success && json.data) {
          const items: SearchResultItem[] = [];

          if (Array.isArray(json.data.documents)) {
            for (const doc of json.data.documents) {
              items.push({
                id: `doc-${doc.id}`,
                type: "document",
                title: doc.title,
                snippet: doc.description || "Manual study document with structured notes.",
                breadcrumb: "My Library / Documents",
                timestamp: "Recent",
                url: `/library/documents/${doc.id}`,
              });
            }
          }

          if (Array.isArray(json.data.topics)) {
            for (const topic of json.data.topics) {
              items.push({
                id: `topic-${topic.id}`,
                type: "topic",
                title: topic.title,
                snippet: topic.plainText || "Topic notes and study materials.",
                breadcrumb: topic.documentTitle ? `Documents / ${topic.documentTitle}` : "Study Notes",
                timestamp: "2h ago",
                url: `/library/documents/${topic.documentId}/topics/${topic.id}`,
              });
            }
          }

          if (Array.isArray(json.data.folders)) {
            for (const folder of json.data.folders) {
              items.push({
                id: `folder-${folder.id}`,
                type: "folder",
                title: folder.name,
                snippet: "Organized folder collection of documents.",
                breadcrumb: "My Library / Folders",
                timestamp: "Active",
                url: `/library/folders/${folder.id}`,
              });
            }
          }

          setResults(items);
        }
      } catch {
        // Fallback
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  const effectiveResults = query.trim() ? results : [];
  const docCount = effectiveResults.filter((r) => r.type === "document").length;
  const topicCount = effectiveResults.filter((r) => r.type === "topic").length;
  const folderCount = effectiveResults.filter((r) => r.type === "folder").length;

  const filteredResults = effectiveResults.filter((r) => {
    if (activeFilter === "documents") return r.type === "document";
    if (activeFilter === "topics") return r.type === "topic";
    if (activeFilter === "folders") return r.type === "folder";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Search Header Bar (Matches Screen 5) */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-5">
        {/* Search Input Box */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-[var(--accent)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, topics, code..."
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base rounded-2xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills and Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("documents")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "documents"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Documents ({docCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("topics")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "topics"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Topics ({topicCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("folders")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "folders"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Folders ({folderCount})
            </button>
          </div>

          {/* Right Dropdown filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-secondary)]">
              <span>All Types</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-secondary)]">
              <span>Last Modified</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Search Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search Results List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)] rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              Searching knowledge library...
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-xs transition-all flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                    {item.type === "document" && <FileText className="w-4 h-4" />}
                    {item.type === "topic" && <BookOpen className="w-4 h-4" />}
                    {item.type === "folder" && <Folder className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {item.title}
                    </h3>
                    {item.snippet && (
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                    {item.breadcrumb && (
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        {item.breadcrumb}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {item.timestamp && (
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {item.timestamp}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))
          ) : query ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)] rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              No matching notes, topics, or folders found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[var(--text-muted)] rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              Type a search query above or use Ctrl+K anywhere to find notes instantly.
            </div>
          )}
        </div>

        {/* Right 1 Col: Search Tips (Matches Screen 5) */}
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Lightbulb className="w-4 h-4" />
              <h4 className="font-semibold text-xs text-[var(--text-primary)]">
                Search Tips
              </h4>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>Use quotes for exact match (e.g. &ldquo;Spring Boot&rdquo;)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>Search within documents and topic plain text</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>Filter by type (Documents, Topics, Folders) or date</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
