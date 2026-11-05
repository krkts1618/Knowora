"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Folder,
  BookOpen,
  Bookmark,
  Clock,
  Plus,
  Upload,
  ArrowRight,
  Pencil,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { HeroIllustration } from "@/components/ui/HeroIllustration";
import { EmptyState } from "@/components/ui/EmptyState";

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

export function DashboardClient({
  user,
  metrics,
  recentDocs,
  recentViews,
  bookmarksList,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

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
  const firstName = userName.split(" ")[0];

  // Pick top document for "Continue Reading"
  const topDoc = recentDocs[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16">
      {/* ==================================================
          1. HERO BANNER (Matches Screen 1)
          ================================================== */}
      <div className="relative rounded-3xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-card)] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Content */}
        <div className="flex-1 flex flex-col gap-3 z-10 max-w-xl">
          <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Welcome back, <span className="text-[var(--text-primary)] font-semibold">{firstName}!</span> 👋
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            Your Knowledge, <br />
            Organized <span className="text-[var(--accent)] font-serif italic font-normal">Beautifully.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
            Capture ideas, explore concepts, and build your personal knowledge library.
          </p>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Primary Pill Button */}
            <button
              type="button"
              onClick={openCreateDoc}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Document</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Secondary Pill: New Folder */}
            <button
              type="button"
              onClick={openCreateFolder}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium text-xs hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>New Folder</span>
            </button>

            {/* Secondary Pill: Upload PDF */}
            <button
              type="button"
              onClick={openUploadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium text-xs hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {/* Right Botanical Composition */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0">
          <HeroIllustration />
        </div>
      </div>

      {/* ==================================================
          2. TAB VIEW SELECTOR (Recent, Bookmarks, Tags or Overview)
          ================================================== */}
      {currentTab && (
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            ← Overview
          </Link>
          <span className="text-xs font-semibold text-[var(--text-primary)] px-2 py-1 rounded-lg bg-[var(--surface-muted)] capitalize">
            {currentTab}
          </span>
        </div>
      )}

      {/* TAB: BOOKMARKS */}
      {currentTab === "bookmarks" && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Bookmarked Topics
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {bookmarksList.length} saved
            </span>
          </div>

          {bookmarksList.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              description="Save key topics and formulas with bookmarks for quick reference during study sessions."
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarksList.map((bm) => (
                <Link
                  key={bm.id}
                  href={`/library/documents/${bm.documentId}/topics/${bm.topicId}`}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Bookmark className="w-4 h-4 text-[var(--accent)] fill-current shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {bm.topicTitle}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        {bm.documentTitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                    {new Date(bm.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: RECENT */}
      {currentTab === "recent" && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Recently Viewed Topics
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {recentViews.length} views
            </span>
          </div>

          {recentViews.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No recent views"
              description="Topics you read and edit will appear here automatically."
              className="py-12"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {recentViews.map((rv) => (
                <Link
                  key={rv.id}
                  href={`/library/documents/${rv.documentId}/topics/${rv.topicId}`}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {rv.topicTitle}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        {rv.documentTitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                    {new Date(rv.viewedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: TAGS */}
      {currentTab === "tags" && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Knowledge Tags
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 py-4">
            {["Computer Science", "Algorithms", "Operating Systems", "Spring Boot", "Database", "Machine Learning", "ExamPrep"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          3. MAIN 3-CARD DASHBOARD GRID (Matches Screen 1)
          ================================================== */}
      {!currentTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Continue Reading */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-wide">
                Continue Reading
              </h3>
              <Link
                href="/library"
                className="text-[11px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Document Thumbnail Card */}
            {topDoc ? (
              <Link
                href={`/library/documents/${topDoc.id}`}
                className="flex flex-col gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--accent)] transition-all group"
              >
                {/* Thumbnail Graphic */}
                <div className="h-28 rounded-xl bg-gradient-to-br from-[#121E17] via-[#1A2E22] to-[#264532] border border-[var(--border)]/50 relative overflow-hidden flex items-end p-3">
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-mono text-[var(--accent)] border border-white/10">
                    Spring Boot
                  </div>
                  <BookOpen className="absolute right-3 top-3 w-8 h-8 text-[var(--accent)]/20" />
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {topDoc.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                    {topDoc.description || "Structured notes and concepts."}
                  </p>
                </div>

                {/* Reading Progress */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span>Progress</span>
                    <span className="font-bold text-[var(--accent)]">60%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div className="w-[60%] h-full rounded-full bg-[var(--accent)]" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
                No active document yet. Create your first document to track reading progress.
              </div>
            )}
          </div>

          {/* Card 2: Recent Activity */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between gap-4">
            <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-wide">
              Recent Activity
            </h3>

            <div className="flex flex-col gap-3 my-auto">
              {recentDocs.length > 0 ? (
                <>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]/70">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                        You edited {recentDocs[0]?.title || "Notes"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        2h ago
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]/70">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                        You added a new topic
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        4h ago
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)]/70">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                        You uploaded study guide
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        1d ago
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-[var(--text-muted)] italic py-4 text-center">
                  No activity recorded yet.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between">
              <span>Automatic tracking</span>
              <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 3: Quick Overview */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between gap-4">
            <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-wide">
              Quick Overview
            </h3>

            <div className="grid grid-cols-1 gap-2.5 my-auto">
              {/* Stat 1: Documents */}
              <Link
                href="/library"
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      {metrics.docCount}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Documents
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>

              {/* Stat 2: Collections */}
              <Link
                href="/library"
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      {metrics.folderCount}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Collections
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>

              {/* Stat 3: Topics */}
              <Link
                href="/library"
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      {metrics.topicCount}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Topics
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </Link>
            </div>

            <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between">
              <span>Synced with Neon DB</span>
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
