"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon, Shield } from "lucide-react";
import { NoteNestLogo } from "@/components/ui/NoteNestLogo";

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
    <div className="min-h-screen w-full flex flex-col justify-between bg-[var(--canvas)] text-[var(--text-primary)] transition-colors duration-150 overflow-y-auto relative select-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#E5B450]/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <NoteNestLogo size="md" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-pointer shadow-xs"
        >
          {isDark ? <Sun className="w-4 h-4 text-[var(--accent)]" /> : <Moon className="w-4 h-4 text-[var(--accent)]" />}
        </button>
      </header>

      {/* Main card */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 z-10 select-text">
        <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-7 md:p-9 shadow-[var(--shadow-modal)] flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5 z-10">
        <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>NoteNest Private Study Knowledge Workspace</span>
      </footer>
    </div>
  );
}
