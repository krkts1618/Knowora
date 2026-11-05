"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Split,
  BookOpen,
  Check,
} from "lucide-react";

export interface PdfReaderProps {
  document: {
    id: string;
    title: string;
    sourceType: string;
    folderId?: string | null;
  };
  topics: Array<{
    id: string;
    title: string;
  }>;
}

export function PdfReaderView({ document: doc, topics }: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState(12);
  const [totalPages] = useState(120);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 15, 200));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 15, 50));

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--canvas)] text-[var(--text-primary)] select-none overflow-hidden">
      {/* Top PDF Toolbar (Matches Screen 4) */}
      <div className="h-14 px-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-4 shrink-0">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/library/documents/${doc.id}`}
            className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shrink-0"
            title="Back to Topic Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
            {doc.title}.pdf
          </span>
        </div>

        {/* Center: Page Controls & Zoom */}
        <div className="flex items-center gap-3">
          {/* Page Counter */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-muted)] border border-[var(--border)] px-2.5 py-1 rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-0.5 hover:text-[var(--accent)] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-medium px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:text-[var(--accent)] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--surface-muted)] border border-[var(--border)] px-2 py-1 rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-0.5 hover:text-[var(--accent)] cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-0.5 hover:text-[var(--accent)] cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/library/documents/${doc.id}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Split with Editor"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Editor</span>
          </Link>

          <button
            type="button"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Thumbnail Strip */}
        <div className="w-20 md:w-24 border-r border-[var(--border)] bg-[var(--sidebar)] p-2.5 flex flex-col gap-2.5 overflow-y-auto shrink-0 select-none">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all cursor-pointer ${
                currentPage === page
                  ? "border-[var(--accent)] bg-[var(--surface)] shadow-xs ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)]/70 hover:border-[var(--accent)]/50"
              }`}
            >
              <div className="w-full aspect-[3/4] bg-[var(--surface-muted)] rounded-lg flex flex-col p-1.5 gap-1 overflow-hidden">
                <div className="w-3/4 h-1 bg-[var(--text-muted)]/30 rounded-xs" />
                <div className="w-full h-0.5 bg-[var(--text-muted)]/20 rounded-xs" />
                <div className="w-5/6 h-0.5 bg-[var(--text-muted)]/20 rounded-xs" />
                <div className="w-2/3 h-0.5 bg-[var(--text-muted)]/20 rounded-xs" />
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {page}
              </span>
            </button>
          ))}
        </div>

        {/* Center: PDF Page Canvas (Matches Screen 4) */}
        <div className="flex-1 bg-[var(--canvas)] p-6 md:p-10 flex items-center justify-center overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-[#FCFAF6] text-[#1A231C] rounded-2xl shadow-xl p-8 sm:p-12 border border-[#E8E2D5] flex flex-col gap-6 select-text transition-transform duration-150"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div className="border-b border-[#E8E2D5] pb-4 flex items-center justify-between">
              <span className="text-xs font-mono text-[#6E7D72] uppercase tracking-wider">
                {doc.title} — Chapter 1
              </span>
              <span className="text-xs font-mono text-[#6E7D72]">
                Page {currentPage}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17221A]">
                1. Introduction
              </h1>
              <h2 className="text-lg font-semibold text-[#2F4235]">
                1.1 What is Spring Boot?
              </h2>
              <p className="text-sm leading-relaxed text-[#3B4D41]">
                Spring Boot is a powerful framework that simplifies the development of production-ready applications in Java by offering opinionated defaults and embedded servlet containers.
              </p>
            </div>

            {/* Key Benefits Callout Box */}
            <div className="p-5 rounded-2xl bg-[#EFEADF] border border-[#DDD5C4] flex flex-col gap-2.5">
              <h3 className="font-semibold text-xs text-[#1F6B4D] tracking-wide uppercase">
                Key Benefits
              </h3>
              <ul className="flex flex-col gap-2 text-xs text-[#2A3B2F]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1F6B4D] shrink-0" />
                  <span>Auto-configuration eliminates repetitive boilerplate XML/Java configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1F6B4D] shrink-0" />
                  <span>Embedded servers (Tomcat, Jetty, Undertow) eliminate separate WAR deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1F6B4D] shrink-0" />
                  <span>Production-ready actuator endpoints for metrics, health checks, and telemetry</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Related Topics Panel (Matches Screen 4) */}
        <div className="hidden lg:flex w-72 border-l border-[var(--border)] bg-[var(--sidebar)] p-4 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-xs text-[var(--text-primary)]">
                Related Topics
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {topics.length} extracted
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {topics.length > 0 ? (
              topics.map((t) => (
                <Link
                  key={t.id}
                  href={`/library/documents/${doc.id}/topics/${t.id}`}
                  className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-center justify-between text-xs group"
                >
                  <span className="truncate font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {t.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic py-4 text-center">
                No indexed topics found for this page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
