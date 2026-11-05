"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { NoteNestLogo } from "@/components/ui/NoteNestLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--canvas)] text-[var(--text-primary)] select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-10 shadow-[var(--shadow-modal)] flex flex-col items-center text-center gap-6 z-10">
        <NoteNestLogo size="lg" />

        <div className="flex flex-col gap-2">
          <span className="text-4xl sm:text-5xl font-mono font-bold text-[var(--accent)]">
            404
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The study note, document, or topic you are searching for does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs hover:opacity-95 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
