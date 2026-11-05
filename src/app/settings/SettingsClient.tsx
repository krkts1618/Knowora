"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  Monitor,
  Check,
  Sparkles,
} from "lucide-react";
import { useTheme, ThemeMode } from "@/context/theme-context";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { FormError } from "@/components/auth/FormError";

interface SettingsClientProps {
  initialTheme: string;
  initialEditorPreferences: Record<string, unknown>;
  initialKeyboardShortcuts: Record<string, unknown>;
}

type SettingsTab = "appearance" | "notifications" | "workspace" | "privacy" | "about";

const ACCENT_COLORS = [
  { id: "forest", name: "Forest Green", hex: "#1F6B4D" },
  { id: "sage", name: "Sage", hex: "#72C49A" },
  { id: "olive", name: "Olive", hex: "#5F7142" },
  { id: "sand", name: "Sand", hex: "#D4A373" },
  { id: "terracotta", name: "Terracotta", hex: "#C86D51" },
  { id: "slate", name: "Slate", hex: "#4A6B82" },
  { id: "lavender", name: "Lavender", hex: "#7B68EE" },
];

export function SettingsClient({
  initialEditorPreferences,
  initialKeyboardShortcuts,
}: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [selectedAccent, setSelectedAccent] = useState("forest");

  const [editorFontSize, setEditorFontSize] = useState<number>(
    typeof initialEditorPreferences.fontSize === "number"
      ? initialEditorPreferences.fontSize
      : 15
  );
  const [lineNumbers, setLineNumbers] = useState<boolean>(
    typeof initialEditorPreferences.lineNumbers === "boolean"
      ? initialEditorPreferences.lineNumbers
      : true
  );
  const [autoSave, setAutoSave] = useState<boolean>(
    typeof initialEditorPreferences.autoSave === "boolean"
      ? initialEditorPreferences.autoSave
      : true
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          editorPreferences: {
            ...initialEditorPreferences,
            fontSize: Number(editorFontSize),
            lineNumbers,
            autoSave,
          },
          keyboardShortcuts: initialKeyboardShortcuts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update preferences");
      }

      setSuccess("Preferences saved successfully");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 flex flex-col gap-6">
      {/* Header (Matches Screen 6) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Customize your NoteNest experience.
        </p>
      </div>

      {/* Horizontal Navigation Tabs (Matches Screen 6) */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-[var(--border)] overflow-x-auto pb-1">
        {[
          { id: "appearance", label: "Appearance" },
          { id: "notifications", label: "Notifications" },
          { id: "workspace", label: "Workspace" },
          { id: "privacy", label: "Data & Privacy" },
          { id: "about", label: "About" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <FormSuccess message={success} />
      <FormError message={error} />

      {/* ==================================================
          TAB 1: APPEARANCE (Matches Screen 6)
          ================================================== */}
      {activeTab === "appearance" && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-8">
            {/* Theme Mode Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">
                Theme
              </label>
              <div className="inline-flex p-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] max-w-fit">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => applyTheme(opt.id as ThemeMode)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Swatches */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">
                Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {ACCENT_COLORS.map((col) => {
                  const isPicked = selectedAccent === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedAccent(col.id)}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isPicked && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Preview Card (Landscape Illustration) */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">
                Interface Preview
              </label>
              <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[#0C130E] flex items-center justify-center p-6 shadow-md">
                {/* Landscape Mountain Pine Illustration */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 600 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Moon */}
                  <circle cx="480" cy="50" r="18" fill="#F4E8C1" fillOpacity="0.85" />
                  <circle cx="484" cy="48" r="15" fill="#0C130E" />

                  {/* Mountains background */}
                  <path
                    d="M0 200L120 120L220 160L360 80L480 140L600 110V200H0Z"
                    fill="#152118"
                  />
                  <path
                    d="M0 200L80 140L180 175L300 115L420 165L540 135L600 160V200H0Z"
                    fill="#1B2B20"
                  />

                  {/* Foreground Pine Trees */}
                  <path d="M50 200L65 140L80 200H50Z" fill="#0E1711" />
                  <path d="M70 200L85 130L100 200H70Z" fill="#121D15" />
                  <path d="M520 200L540 125L560 200H520Z" fill="#0E1711" />
                  <path d="M550 200L565 135L580 200H550Z" fill="#121D15" />

                  {/* Soft fog overlay */}
                  <rect y="170" width="600" height="30" fill="url(#fog)" />

                  <defs>
                    <linearGradient id="fog" x1="300" y1="170" x2="300" y2="200" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0C130E" stopOpacity="0" />
                      <stop offset="1" stopColor="#0C130E" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute bottom-4 left-5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-mono text-[var(--accent)] border border-white/10">
                  NoteNest Botanical Dark Mode Active
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs hover:opacity-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Appearance"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ==================================================
          TAB 2: NOTIFICATIONS
          ================================================== */}
      {activeTab === "notifications" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Notification Preferences
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Configure how you receive updates, study reminders, and version alerts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                title: "Topic Snapshot Alerts",
                desc: "Notify when automatic version snapshots are preserved during editing.",
                checked: true,
              },
              {
                title: "Study Streak Reminders",
                desc: "Receive daily review reminders to revisit bookmarked topics.",
                checked: false,
              },
              {
                title: "System & Security Updates",
                desc: "Important security notifications and schema updates.",
                checked: true,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {item.desc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          TAB 3: WORKSPACE PREFERENCES
          ================================================== */}
      {activeTab === "workspace" && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Editor Configuration
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Control typography sizing, line numbers, and autosave behavior.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Editor Font Size</p>
                <p className="text-[11px] text-[var(--text-muted)]">Target font size for the Tiptap rich-text canvas</p>
              </div>
              <select
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none"
              >
                <option value={13}>13px</option>
                <option value={14}>14px</option>
                <option value={15}>15px (Recommended)</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Line Numbers in Code Blocks</p>
                <p className="text-[11px] text-[var(--text-muted)]">Display line indices alongside syntax-highlighted code</p>
              </div>
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">1500ms Debounced Autosave</p>
                <p className="text-[11px] text-[var(--text-muted)]">Automatically sync topic content to Neon PostgreSQL</p>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold text-xs hover:opacity-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Workspace"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ==================================================
          TAB 4: DATA & PRIVACY
          ================================================== */}
      {activeTab === "privacy" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Data & Tenant Isolation
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Your notes are strictly isolated per authenticated user in PostgreSQL with Row-Level Security.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Database Row-Level Security
            </span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every document, topic, and folder operation enforces strict ownership boundaries via `withUserContext`. No unauthorized user can access your study materials.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          TAB 5: ABOUT
          ================================================== */}
      {activeTab === "about" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                NoteNest Study Workspace
              </h2>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Version 1.0.0 — Production Build
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            NoteNest is an editorial study workspace designed for developers and researchers to capture ideas, structure concepts with unlimited nesting, write formulas with KaTeX, and retrieve knowledge instantly.
          </p>

          <div className="p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-mono flex flex-col gap-1.5">
            <div>Framework: Next.js App Router (React 19)</div>
            <div>Database: Neon PostgreSQL with Drizzle ORM</div>
            <div>Auth: Better Auth Email/Password</div>
            <div>Rich Text: Tiptap with KaTeX Math & Lowlight Code</div>
          </div>
        </div>
      )}
    </div>
  );
}
