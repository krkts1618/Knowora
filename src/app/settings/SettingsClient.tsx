"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme, ThemeMode } from "@/context/theme-context";
import { AuthButton } from "@/components/auth/AuthButton";
import { FormSuccess } from "@/components/auth/FormSuccess";
import { FormError } from "@/components/auth/FormError";

interface SettingsClientProps {
  initialTheme: string;
  initialEditorPreferences: Record<string, unknown>;
  initialKeyboardShortcuts: Record<string, unknown>;
}

export function SettingsClient({
  initialEditorPreferences,
  initialKeyboardShortcuts,
}: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [editorFontSize, setEditorFontSize] = useState<number>(
    (typeof initialEditorPreferences.fontSize === "number"
      ? initialEditorPreferences.fontSize
      : 15)
  );
  const [lineNumbers, setLineNumbers] = useState<boolean>(
    (typeof initialEditorPreferences.lineNumbers === "boolean"
      ? initialEditorPreferences.lineNumbers
      : true)
  );
  const [autoSave, setAutoSave] = useState<boolean>(
    (typeof initialEditorPreferences.autoSave === "boolean"
      ? initialEditorPreferences.autoSave
      : true)
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
    <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] flex flex-col gap-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Workspace Preferences
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Customize your interface appearance, editor configuration, and shortcuts
          </p>
        </div>

        <FormSuccess message={success} />
        <FormError message={error} />

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Theme selector */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun, desc: "Forest & Sage" },
                { id: "dark", label: "Dark", icon: Moon, desc: "OLED Charcoal" },
                { id: "system", label: "System", icon: Monitor, desc: "OS Default" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => applyTheme(opt.id as "light" | "dark" | "system")}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">{opt.desc}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor preferences */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]">
            <h2 className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
              Editor Preferences
            </h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Editor Font Size</p>
                <p className="text-[11px] text-[var(--text-muted)]">Font size for rich-text note editor</p>
              </div>
              <select
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
              >
                <option value={13}>13px</option>
                <option value={14}>14px</option>
                <option value={15}>15px (Default)</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Line Numbers</p>
                <p className="text-[11px] text-[var(--text-muted)]">Show gutter numbers in code blocks</p>
              </div>
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">Automatic Cloud Save</p>
                <p className="text-[11px] text-[var(--text-muted)]">Periodically save editor revisions</p>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <AuthButton type="submit" loading={loading} className="w-auto px-6">
              Save Preferences
            </AuthButton>
          </div>
        </form>
      </div>
    </div>
  );
}
