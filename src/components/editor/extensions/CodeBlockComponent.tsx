"use client";

import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { Check, Copy } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "SQL", value: "sql" },
  { label: "HTML / XML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Bash / Shell", value: "bash" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Kotlin", value: "kotlin" },
  { label: "YAML", value: "yaml" },
  { label: "Plain Text", value: "plaintext" },
];

export function CodeBlockComponent({
  node,
  updateAttributes,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = node.textContent;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedLanguage = node.attrs.language || "javascript";

  return (
    <NodeViewWrapper className="code-block-wrapper my-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-disabled)]/40" />
          <select
            contentEditable={false}
            value={selectedLanguage}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-transparent text-[11px] font-mono text-[var(--text-secondary)] focus:outline-none cursor-pointer py-0.5 hover:text-[var(--text-primary)] transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          contentEditable={false}
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[var(--status-success)]" />
              <span className="text-[var(--status-success)] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-[var(--text-muted)]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-[var(--text-primary)]">
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}

export function createCodeBlockView() {
  return ReactNodeViewRenderer(CodeBlockComponent);
}
