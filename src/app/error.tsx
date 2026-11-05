"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { NoteNestLogo } from "@/components/ui/NoteNestLogo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--canvas)] text-[var(--text-primary)] select-none relative overflow-hidden">
      <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-10 shadow-[var(--shadow-modal)] flex flex-col items-center text-center gap-6 z-10">
        <NoteNestLogo size="lg" />

        <div className="w-12 h-12 rounded-2xl bg-[var(--status-error)]/10 text-[var(--status-error)] flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            An unexpected error occurred while loading this view. You can retry or navigate back to the dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium text-xs hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs hover:opacity-95 transition-all shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
