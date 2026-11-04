"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Sigma, X, AlertCircle } from "lucide-react";
import katex from "katex";

export interface InsertMathModalProps {
  isOpen: boolean;
  defaultMode?: "inline" | "block";
  initialLatex?: string;
  onClose: () => void;
  onSubmit: (data: { latex: string; mode: "inline" | "block" }) => void;
}

const MATH_TEMPLATES = [
  { label: "Fraction", latex: "\\frac{a}{b}" },
  { label: "Summation", latex: "\\sum_{i=1}^{n} x_i" },
  { label: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
  { label: "Square Root", latex: "\\sqrt{x^2 + y^2}" },
  { label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
  { label: "Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
];

export function InsertMathModal({
  isOpen,
  defaultMode = "block",
  initialLatex = "",
  onClose,
  onSubmit,
}: InsertMathModalProps) {
  const [mode, setMode] = useState<"inline" | "block">(defaultMode);
  const [latex, setLatex] = useState(initialLatex || (defaultMode === "inline" ? "E = mc^2" : "\\int_0^1 x^2 dx = \\frac{1}{3}"));
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Compute live rendered KaTeX HTML
  const renderedHtml = useMemo(() => {
    if (!latex.trim()) return "";
    try {
      return katex.renderToString(latex, {
        throwOnError: true,
        displayMode: mode === "block",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid LaTeX syntax";
      return `<span class="text-[var(--status-error)] text-xs font-mono">${msg}</span>`;
    }
  }, [latex, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latex.trim()) {
      setError("Please provide a LaTeX equation.");
      return;
    }

    try {
      // Validate KaTeX syntax
      katex.renderToString(latex, { throwOnError: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid equation";
      setError(`LaTeX syntax error: ${msg}`);
      return;
    }

    onSubmit({ latex: latex.trim(), mode });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Insert LaTeX Mathematical Equation
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Render crisp scientific and mathematical formulas with KaTeX
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Equation Mode:</label>
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode("inline")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  mode === "inline"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Inline ($...$)
              </button>
              <button
                type="button"
                onClick={() => setMode("block")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  mode === "block"
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Block ($$...$$)
              </button>
            </div>
          </div>

          {/* Quick template snippets */}
          <div>
            <span className="block text-[11px] text-[var(--text-muted)] mb-1.5">
              Quick LaTeX Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MATH_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setLatex((prev) => (prev ? `${prev} ${tmpl.latex}` : tmpl.latex))}
                  className="px-2 py-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input text area */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              LaTeX Expression <span className="text-[var(--status-error)]">*</span>
            </label>
            <textarea
              rows={3}
              value={latex}
              onChange={(e) => {
                setLatex(e.target.value);
                setError(null);
              }}
              placeholder="e.g. \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>

          {/* Live Preview */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              KaTeX Live Preview
            </label>
            <div className="min-h-[64px] p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-center overflow-x-auto text-[var(--text-primary)]">
              {renderedHtml ? (
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              ) : (
                <span className="text-xs text-[var(--text-muted)] italic">
                  Equation preview will render here...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)] mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!latex.trim()}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              Insert Equation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
