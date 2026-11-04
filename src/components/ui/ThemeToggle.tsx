"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/context/theme-context";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export function ThemeToggle({
  variant = "dropdown",
  className = "",
}: {
  variant?: "dropdown" | "cycle";
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle cycle variant (simply toggles light -> dark -> system)
  if (variant === "cycle") {
    const cycleTheme = () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    };

    return (
      <button
        type="button"
        onClick={cycleTheme}
        className={`p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none ${className}`}
        title={`Current: ${theme} (click to cycle)`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[var(--accent)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--accent)]" />
        )}
      </button>
    );
  }

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
    {
      mode: "light",
      label: "Light",
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      mode: "dark",
      label: "Dark",
      icon: <Moon className="w-3.5 h-3.5" />,
    },
    {
      mode: "system",
      label: "System",
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none"
        title="Theme appearance"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] py-1.5 z-50 text-xs">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Appearance
          </div>
          {options.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                setTheme(opt.mode);
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 flex items-center justify-between text-left hover:bg-[var(--surface-hover)] transition-colors ${
                theme === opt.mode
                  ? "text-[var(--accent)] font-medium"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.icon}
                <span>{opt.label}</span>
              </span>
              {theme === opt.mode && <Check className="w-3 h-3 text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
