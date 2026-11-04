"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export interface SearchInputProps {
  onClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  onClick,
  placeholder = "Search notes, topics, documents...",
  className = "",
}: SearchInputProps) {
  const [isMac] = useState(
    () =>
      typeof window !== "undefined" &&
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all text-xs w-full max-w-sm text-left shadow-xs ${className}`}
      aria-label="Open global search (Ctrl+K or Cmd+K)"
    >
      <div className="flex items-center gap-2 min-w-0 truncate">
        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
        <span className="truncate">{placeholder}</span>
      </div>

      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] shrink-0">
        <span>{isMac ? "⌘" : "Ctrl"}</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
