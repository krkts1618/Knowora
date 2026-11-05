"use client";

import React, { useState } from "react";
import { Bell, Clock, Sparkles, X, BookOpen } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "system" | "topic" | "reminder";
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Welcome to NoteNest",
    message: "Your botanical study workspace is ready. Organize topics, notes, and study guides.",
    timestamp: "10m ago",
    read: false,
    type: "system",
  },
  {
    id: "2",
    title: "Version Snapshot Created",
    message: "Topic versions are automatically captured on edit. Review history anytime.",
    timestamp: "1h ago",
    read: true,
    type: "topic",
  },
  {
    id: "3",
    title: "Full-Text Search Active",
    message: "Use Ctrl+K to instantly retrieve topics and code snippets across all documents.",
    timestamp: "1d ago",
    read: true,
    type: "reminder",
  },
];

export function NotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 select-none animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-150 mt-12 sm:mt-14">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-xs text-[var(--text-primary)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent)] text-[var(--accent-foreground)]">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
              >
                Mark read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition-colors flex items-start gap-3 ${
                item.read
                  ? "bg-transparent text-[var(--text-secondary)]"
                  : "bg-[var(--surface-muted)]/60 text-[var(--text-primary)]"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                {item.type === "system" && <Sparkles className="w-3.5 h-3.5" />}
                {item.type === "topic" && <BookOpen className="w-3.5 h-3.5" />}
                {item.type === "reminder" && <Clock className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-xs truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/20 text-center">
          <span className="text-[10px] text-[var(--text-muted)]">
            NoteNest Notification Center
          </span>
        </div>
      </div>
    </div>
  );
}
