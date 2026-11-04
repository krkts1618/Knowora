'use client';

import React, { useState } from 'react';
import { Copy, Check, Info, AlertTriangle, Lightbulb, AlertOctagon } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const lines = content.split('\n');
  const headings: { id: string; text: string; level: number }[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ id, text, level });
    }
  }

  return headings;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-4 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden shadow-xs group">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--surface)] border-b border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono">
        <span className="uppercase text-[11px] font-medium tracking-wider text-[var(--text-muted)]">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-[11px]"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              <span className="text-[var(--status-success)] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-[var(--text-primary)]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                <td className="w-8 select-none text-right pr-4 text-[var(--text-muted)] text-[11px] align-top font-mono">
                  {idx + 1}
                </td>
                <td className="whitespace-pre align-top">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseInlineFormatting(text: string): React.ReactNode {
  // Process inline code, bold, links, math
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex tokens: inline code `...`, bold **...**, link [...](...), math $...$
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\$[^$]+\$)/;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      parts.push(remaining);
      break;
    }

    if (match.index > 0) {
      parts.push(remaining.substring(0, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIndex++}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--surface-muted)] text-[var(--accent)] font-mono text-[13px] border border-[var(--border)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('$') && token.endsWith('$')) {
      parts.push(
        <span
          key={keyIndex++}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--accent)] border border-[var(--border)]"
        >
          {token.slice(1, -1)}
        </span>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={keyIndex++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    remaining = remaining.substring(match.index + token.length);
  }

  return parts;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block
    if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push(
        <CodeBlock
          key={`code-${i}`}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      continue;
    }

    // Callout Alert: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING]
    if (line.startsWith('> [!')) {
      const alertTypeMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      const alertType = alertTypeMatch ? alertTypeMatch[1].toUpperCase() : 'NOTE';
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }

      const AlertIcon = 
        alertType === 'TIP' ? Lightbulb :
        alertType === 'IMPORTANT' ? AlertOctagon :
        alertType === 'WARNING' ? AlertTriangle : Info;

      const borderLeftColor = 
        alertType === 'TIP' ? 'border-l-[var(--status-success)] text-[var(--status-success)]' :
        alertType === 'IMPORTANT' ? 'border-l-[var(--status-warning)] text-[var(--status-warning)]' :
        alertType === 'WARNING' ? 'border-l-[var(--status-error)] text-[var(--status-error)]' :
        'border-l-[var(--status-info)] text-[var(--status-info)]';

      blocks.push(
        <div
          key={`alert-${i}`}
          className={`my-4 p-3.5 rounded-md border border-[var(--border)] border-l-4 bg-[var(--surface-muted)] flex gap-3 shadow-xs ${borderLeftColor}`}
        >
          <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
            <span className="font-semibold block uppercase tracking-wider text-[11px] mb-1">
              {alertType}
            </span>
            {calloutLines.map((cL, cIdx) => (
              <p key={cIdx} className="my-1 text-[var(--text-secondary)]">
                {parseInlineFormatting(cL)}
              </p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-3.5 border-l-2 border-[var(--accent)] text-[var(--text-secondary)] italic text-sm"
        >
          {quoteLines.map((qL, qIdx) => (
            <p key={qIdx}>{parseInlineFormatting(qL)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('|') && lines[i + 1]?.includes('---')) {
      const headerLine = line;
      i += 2; // skip header and delimiter line
      const rowLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rowLines.push(lines[i]);
        i++;
      }

      const headers = headerLine
        .split('|')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      blocks.push(
        <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[var(--surface-muted)] border-b border-[var(--border)] text-[var(--text-primary)] font-medium">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-2.5 whitespace-nowrap text-xs font-semibold">
                    {parseInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rowLines.map((row, rIdx) => {
                const cells = row
                  .split('|')
                  .map(c => c.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                return (
                  <tr key={rIdx} className="hover:bg-[var(--surface-hover)] transition-colors">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-[var(--text-secondary)] text-[13px]">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Math block: $$ ... $$
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const formula = line.trim().slice(2, -2).trim();
      blocks.push(
        <div
          key={`math-${i}`}
          className="my-3 p-3.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-center font-mono text-xs sm:text-sm text-[var(--accent)] overflow-x-auto"
        >
          {formula}
        </div>
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      const text = line.substring(5).trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      blocks.push(
        <h4 key={`h4-${i}`} id={id} className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-2 scroll-mt-20">
          {parseInlineFormatting(text)}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.substring(4).trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      blocks.push(
        <h3 key={`h3-${i}`} id={id} className="text-base font-semibold text-[var(--text-primary)] mt-6 mb-2.5 scroll-mt-20 border-b border-[var(--border-subtle)] pb-1">
          {parseInlineFormatting(text)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      const text = line.substring(3).trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      blocks.push(
        <h2 key={`h2-${i}`} id={id} className="text-xl font-semibold text-[var(--text-primary)] mt-7 mb-3 scroll-mt-20 border-b border-[var(--border)] pb-2">
          {parseInlineFormatting(text)}
        </h2>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^[\*\-]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[\*\-]\s+/)) {
        listItems.push(lines[i].replace(/^[\*\-]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1 list-disc list-inside text-[15px] text-[var(--text-secondary)] leading-[1.65] pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx}>
              <span>{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const numItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        numItems.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-1 list-decimal list-inside text-[15px] text-[var(--text-secondary)] leading-[1.65] pl-1">
          {numItems.map((item, itemIdx) => (
            <li key={itemIdx}>
              <span>{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-[15px] leading-[1.65] text-[var(--text-secondary)]">
        {parseInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{blocks}</div>;
}
