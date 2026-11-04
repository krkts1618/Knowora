"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import { EditorToolbar } from "./EditorToolbar";
import { InlineMathNode, BlockMathNode } from "./extensions/MathExtension";
import { createCodeBlockView } from "./extensions/CodeBlockComponent";
import { CustomImageExtension } from "./extensions/CustomImageExtension";
import { InsertLinkModal } from "./modals/InsertLinkModal";
import { InsertImageModal } from "./modals/InsertImageModal";
import { InsertMathModal } from "./modals/InsertMathModal";

const lowlight = createLowlight(common);

export interface RichTextEditorProps {
  initialContent?: Record<string, unknown>;
  onChange?: (content: Record<string, unknown>, plainText: string) => void;
  onSaveShortcut?: () => void;
  editable?: boolean;
}

export function RichTextEditor({
  initialContent,
  onChange,
  onSaveShortcut,
  editable = true,
}: RichTextEditorProps) {
  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [mathModalMode, setMathModalMode] = useState<"inline" | "block">("block");

  // Create lowlight code block with custom React view
  const customCodeBlock = useMemo(() => {
    return CodeBlockLowlight.extend({
      addNodeView() {
        return createCodeBlockView();
      },
    }).configure({
      lowlight,
      defaultLanguage: "javascript",
    });
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
      Placeholder.configure({
        placeholder: "Write study notes, formulas, code snippets, or outlines here...",
      }),
      customCodeBlock,
      InlineMathNode,
      BlockMathNode,
      CustomImageExtension,
    ],
    content:
      initialContent && typeof initialContent === "object" && Object.keys(initialContent).length > 0
        ? initialContent
        : { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const text = ed.getText();
      onChange?.(json, text);
    },
  });

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveShortcut?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSaveShortcut]);

  // Sync content when initialContent changes if editor has different content ID
  useEffect(() => {
    if (editor && initialContent) {
      const currentJson = editor.getJSON();
      if (JSON.stringify(currentJson) !== JSON.stringify(initialContent)) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  const handleOpenLinkModal = useCallback(() => {
    setIsLinkModalOpen(true);
  }, []);

  const handleApplyLink = useCallback(
    (url: string) => {
      if (!editor) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    },
    [editor]
  );

  const handleOpenImageModal = useCallback(() => {
    setIsImageModalOpen(true);
  }, []);

  const handleApplyImage = useCallback(
    (data: {
      src: string;
      alt?: string;
      caption?: string;
      alignment?: "left" | "center" | "right";
    }) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "customImage",
          attrs: {
            src: data.src,
            alt: data.alt || null,
            caption: data.caption || null,
            alignment: data.alignment || "center",
            width: "100%",
          },
        })
        .run();
    },
    [editor]
  );

  const handleOpenMathModal = useCallback((mode: "inline" | "block") => {
    setMathModalMode(mode);
    setIsMathModalOpen(true);
  }, []);

  const handleApplyMath = useCallback(
    (data: { latex: string; mode: "inline" | "block" }) => {
      if (!editor) return;
      if (data.mode === "inline") {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "inlineMath",
            attrs: { latex: data.latex },
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "blockMath",
            attrs: { latex: data.latex },
          })
          .run();
      }
    },
    [editor]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Editor Toolbar */}
      <EditorToolbar
        editor={editor}
        onOpenLinkModal={handleOpenLinkModal}
        onOpenImageModal={handleOpenImageModal}
        onOpenMathModal={handleOpenMathModal}
      />

      {/* Editor Content Area */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto cursor-text">
        <EditorContent editor={editor} className="max-w-4xl mx-auto focus:outline-none" />
      </div>

      {/* Modals */}
      <InsertLinkModal
        isOpen={isLinkModalOpen}
        initialUrl={editor?.getAttributes("link").href || ""}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleApplyLink}
      />

      <InsertImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSubmit={handleApplyImage}
      />

      <InsertMathModal
        isOpen={isMathModalOpen}
        defaultMode={mathModalMode}
        onClose={() => setIsMathModalOpen(false)}
        onSubmit={handleApplyMath}
      />
    </div>
  );
}
