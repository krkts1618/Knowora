"use client";

import React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Unlink,
  ImageIcon,
  Table as TableIcon,
  Code2,
  Sigma,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export interface EditorToolbarProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
  onOpenMathModal: (mode: "inline" | "block") => void;
}

export function EditorToolbar({
  editor,
  onOpenLinkModal,
  onOpenImageModal,
  onOpenMathModal,
}: EditorToolbarProps) {
  if (!editor) return null;

  // Table options
  const tableItems: DropdownMenuItem[] = [
    {
      label: "Insert 3x3 Table",
      icon: <TableIcon className="w-3.5 h-3.5 text-[var(--accent)]" />,
      onClick: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Add Row Above",
      onClick: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      label: "Add Row Below",
      onClick: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      label: "Delete Row",
      danger: true,
      onClick: () => editor.chain().focus().deleteRow().run(),
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Add Column Left",
      onClick: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: "Add Column Right",
      onClick: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      label: "Delete Column",
      danger: true,
      onClick: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      divider: true,
      label: "",
    },
    {
      label: "Delete Entire Table",
      danger: true,
      onClick: () => editor.chain().focus().deleteTable().run(),
    },
  ];

  // Heading options
  const headingItems: DropdownMenuItem[] = [
    {
      label: "Paragraph",
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Heading 1 (Large)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2 (Medium)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3 (Small)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ];

  // Active heading label
  let currentStyleLabel = "Paragraph";
  if (editor.isActive("heading", { level: 1 })) currentStyleLabel = "Heading 1";
  else if (editor.isActive("heading", { level: 2 })) currentStyleLabel = "Heading 2";
  else if (editor.isActive("heading", { level: 3 })) currentStyleLabel = "Heading 3";

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-20 select-none">
      {/* Group: History */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group: Paragraph & Headings Dropdown */}
      <div className="flex items-center pr-1 border-r border-[var(--border)]">
        <DropdownMenu
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Text Style"
            >
              <span>{currentStyleLabel}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>
          }
          items={headingItems}
        />
      </div>

      {/* Group: Basic Formatting */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bold")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("italic")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("underline")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("strike")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("code")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("highlight")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Highlight"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group: Lists */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bulletList")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("orderedList")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("taskList")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Task List with Checkboxes"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group: Alignment */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Justify"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group: Links & Blocks */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-[var(--border)]">
        <button
          type="button"
          onClick={onOpenLinkModal}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("link")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Insert Link (Ctrl+K)"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
            title="Remove Link"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("blockquote")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Group: Code, Math, Table & Image */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Code Block with Syntax Highlighting"
        >
          <Code2 className="w-3.5 h-3.5" />
        </button>

        {/* Math Dropdown / Actions */}
        <button
          type="button"
          onClick={() => onOpenMathModal("block")}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="LaTeX Math Equation ($$)"
        >
          <Sigma className="w-3.5 h-3.5" />
        </button>

        {/* Table Dropdown */}
        <DropdownMenu
          trigger={
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive("table")
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
              title="Table Operations"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          }
          items={tableItems}
        />

        {/* Image Modal Trigger */}
        <button
          type="button"
          onClick={onOpenImageModal}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Insert Image / Diagram"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
