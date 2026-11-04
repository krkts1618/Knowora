"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Folder,
  BookOpen,
  Bookmark,
  Clock,
  Plus,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export interface DashboardClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  metrics: {
    docCount: number;
    folderCount: number;
    topicCount: number;
    bookmarkCount: number;
  };
  recentDocs: Array<{
    id: string;
    title: string;
    description: string | null;
    folderId: string | null;
    createdAt: string;
  }>;
  recentViews: Array<{
    id: string;
    topicId: string;
    topicTitle: string;
    documentId: string;
    documentTitle: string;
    viewedAt: string;
  }>;
  bookmarksList: Array<{
    id: string;
    topicId: string;
    topicTitle: string;
    documentId: string;
    documentTitle: string;
    createdAt: string;
  }>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardClient({
  user,
  metrics,
  recentDocs,
  recentViews,
  bookmarksList,
}: DashboardClientProps) {
  const router = useRouter();
  const greeting = getGreeting();

  const openCreateDoc = () => {
    window.dispatchEvent(new CustomEvent("open-create-document"));
  };

  const openCreateFolder = () => {
    window.dispatchEvent(new CustomEvent("open-create-folder"));
  };

  const openUploadPdf = () => {
    window.dispatchEvent(new CustomEvent("open-upload-pdf"));
  };

  const userName = user.name || "Scholar";

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: "Dashboard", current: true }]} />

      {/* Section A: Welcome Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[var(--accent)] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
            Here is what&rsquo;s happening across your study notes and knowledge library. Retrieve key topics, manage documents, or organize your semester.
          </p>
        </div>

        {/* Section B: Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openCreateDoc}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>New Document</span>
          </button>

          <button
            type="button"
            onClick={openCreateFolder}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Folder className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>New Folder</span>
          </button>

          <button
            type="button"
            onClick={openUploadPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            title="Upload PDF (Scheduled for Phase 5)"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            <span>Upload PDF</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] font-semibold">
              Phase 5
            </span>
          </button>
        </div>
      </div>

      {/* Section D: Library Overview 4-Stat Grid (Real Database Queries) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Library Metrics
          </h2>
          <span className="text-[11px] text-[var(--text-muted)]">
            Live database counts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Documents"
            value={metrics.docCount}
            icon={FileText}
            description="Compiled study notes & guides"
          />

          <StatCard
            label="Total Folders"
            value={metrics.folderCount}
            icon={Folder}
            description="Nested organizational collections"
          />

          <StatCard
            label="Total Topics"
            value={metrics.topicCount}
            icon={BookOpen}
            description="Searchable indexed concepts"
          />

          <StatCard
            label="Bookmarked Topics"
            value={metrics.bookmarkCount}
            icon={Bookmark}
            description="Pinned items for rapid study"
          />
        </div>
      </div>

      {/* Section E: Quick Access & Recent Activity (Side-by-Side or Filtered) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Documents */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Recent Documents
              </h3>
            </div>
            <Link
              href="/library"
              className="text-xs font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents saved"
              description="Create your first study document to organize your topics."
              action={{
                label: "Create Document",
                onClick: openCreateDoc,
                icon: Plus,
              }}
              className="py-8"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/library?doc=${doc.id}`}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {doc.title}
                      </span>
                      {doc.description && (
                        <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                          {doc.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 mt-0.5">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Recently Viewed Topics */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Recently Viewed Topics
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
              Last {recentViews.length}
            </span>
          </div>

          {recentViews.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No recent views"
              description="Topics you inspect or read in your library will show up here for fast access."
              action={{
                label: "Explore Library",
                onClick: () => {
                  router.push("/library");
                },
                icon: BookOpen,
              }}
              className="py-8"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {recentViews.map((view) => (
                <Link
                  key={view.id}
                  href={`/library?topic=${view.topicId}`}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {view.topicTitle}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        in {view.documentTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 mt-0.5">
                    {new Date(view.viewedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Pinned Bookmarks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Bookmarked Topics
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
              {bookmarksList.length} Pinned
            </span>
          </div>

          {bookmarksList.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              description="Bookmark topics while studying to pin critical equations and definitions."
              action={{
                label: "Find Topics",
                onClick: () => {
                  router.push("/library");
                },
                icon: BookOpen,
              }}
              className="py-8"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {bookmarksList.slice(0, 5).map((bm) => (
                <Link
                  key={bm.id}
                  href={`/library?topic=${bm.topicId}`}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Bookmark className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0 fill-[var(--accent)]/15" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {bm.topicTitle}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        in {bm.documentTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 mt-0.5">
                    {new Date(bm.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
