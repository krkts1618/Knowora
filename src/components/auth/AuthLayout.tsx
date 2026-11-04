"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { BookOpen, Sun, Moon } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("notenest_theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("notenest_theme_mode", "light");
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[var(--canvas)] text-[var(--text-primary)] transition-colors duration-150 overflow-y-auto">
      {/* Header bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded-md"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
              NoteNest
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] font-mono">
              Knowledge Workspace
            </span>
          </div>
        </Link>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main card */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 md:p-9 shadow-[var(--shadow-card)] flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 NoteNest. Private & Secure Study Knowledge.</p>
      </footer>
    </div>
  );
}
