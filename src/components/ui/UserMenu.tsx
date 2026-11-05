"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
} from "lucide-react";

export interface UserMenuProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  className?: string;
}

export function UserMenu({ user, className = "" }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      // Fallback redirect if sign out network error happens
      router.push("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = user?.name || "Scholar";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "NN";

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-[var(--accent)]/15 border-2 border-[var(--accent)]/40 text-[var(--accent)] hover:border-[var(--accent)] hover:scale-105 flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs focus:outline-none"
        aria-expanded={isOpen}
        aria-label="User account menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] py-2 z-50 text-xs animate-in fade-in-0 zoom-in-95 duration-100">
          {/* User info banner */}
          <div className="px-3.5 py-2 border-b border-[var(--border)] mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[var(--text-primary)] truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] bg-[var(--surface-muted)] px-2 py-1 rounded-md">
              <Sparkles className="w-3 h-3 text-[var(--accent)] shrink-0" />
              <span>Free Scholar Tier</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/library"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
              <span>My Library</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <User className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Profile Information</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Workspace Settings</span>
            </Link>
          </div>

          <div className="my-1.5 border-t border-[var(--border)]" />

          {/* Sign Out */}
          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="w-full px-3.5 py-2 flex items-center gap-2.5 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
