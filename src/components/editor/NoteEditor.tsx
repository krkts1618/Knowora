'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { MarkdownRenderer } from '../reader/MarkdownRenderer';
import { 
  Save, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Code, 
  Terminal, 
  Table, 
  Link, 
  Info, 
  Eye, 
  Columns, 
  PenLine, 
  CheckCircle2
} from 'lucide-react';

function NoteEditorInner() {
  const {
    editingTopic,
    editorPrefills,
    collections,
    documents,
    saveNote,
    closeEditor,
    askConfirmation,
    showToast,
  } = useKnowledge();

  // Compute initial states directly without useEffect
  const initialColId = editingTopic 
    ? editingTopic.collectionId 
    : (editorPrefills?.collectionId || collections[0]?.id || '');

  const candidateDocs = documents.filter(d => d.collectionId === initialColId && !d.isTrash);
  const initialDocId = editingTopic 
    ? editingTopic.documentId 
    : (editorPrefills?.documentId || candidateDocs[0]?.id || documents[0]?.id || '');

  const [title, setTitle] = useState(editingTopic ? editingTopic.title : '');
  const [content, setContent] = useState(
    editingTopic 
      ? editingTopic.content 
      : `## Overview\n\nWrite your topic summary here...\n\n### Key Concepts\n- Point 1\n- Point 2\n\n\`\`\`typescript\n// Example code\nconsole.log("Ready to study");\n\`\`\`\n`
  );
  const [collectionId, setCollectionId] = useState(initialColId);
  const [documentId, setDocumentId] = useState(initialDocId);
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('split');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Available documents for selected collection
  const availableDocs = documents.filter(d => d.collectionId === collectionId && !d.isTrash);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      showToast('error', 'Validation Error', 'Note title cannot be empty.');
      return;
    }
    if (!documentId) {
      showToast('error', 'Validation Error', 'Please select a parent document.');
      return;
    }

    setIsSaving(true);
    try {
      await saveNote({
        title: title.trim(),
        content,
        collectionId,
        documentId,
        topicId: editingTopic?.id,
      });
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, collectionId, documentId, editingTopic, saveNote, showToast]);

  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCancel = () => {
    if (isDirty) {
      askConfirmation({
        title: 'Discard Unsaved Changes?',
        message: 'You have unsaved edits in this note. Are you sure you want to discard them?',
        confirmLabel: 'Discard Changes',
        danger: true,
        onConfirm: () => closeEditor(),
      });
    } else {
      closeEditor();
    }
  };

  // Helper to insert formatting at cursor
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || 'text') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setIsDirty(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || 'text').length);
    }, 10);
  };

  // Handle Tab key in textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      setContent(prev => prev.substring(0, start) + '  ' + prev.substring(end));
      setIsDirty(true);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[90vh] rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-md bg-[var(--selection)] text-[var(--accent)]">
              <PenLine className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {editingTopic ? 'Edit Topic Note' : 'Create New Study Note'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono">
                  {isDirty ? (
                    <span className="text-[var(--status-warning)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-warning)] animate-pulse" />
                      Unsaved
                    </span>
                  ) : (
                    <span className="text-[var(--status-success)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Saved
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-md bg-[var(--surface-muted)] border border-[var(--border)] p-0.5 text-xs text-[var(--text-secondary)]">
              <button
                onClick={() => setEditorMode('write')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                  editorMode === 'write' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'hover:text-[var(--text-primary)]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                  editorMode === 'preview' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'hover:text-[var(--text-primary)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setEditorMode('split')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                  editorMode === 'split' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'hover:text-[var(--text-primary)]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>

            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--accent-foreground)] text-xs font-medium shadow-xs transition active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>

        {/* Location & Title Configuration Strip */}
        <div className="p-3.5 bg-[var(--surface-muted)] border-b border-[var(--border)] space-y-2.5">
          {/* Target Collection & Document Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Subject Collection
              </label>
              <select
                value={collectionId}
                onChange={e => {
                  const newCol = e.target.value;
                  setCollectionId(newCol);
                  const matchingDocs = documents.filter(d => d.collectionId === newCol && !d.isTrash);
                  if (matchingDocs[0]) setDocumentId(matchingDocs[0].id);
                  setIsDirty(true);
                }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--focus-ring)] transition"
              >
                {collections.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Parent Document
              </label>
              <select
                value={documentId}
                onChange={e => {
                  setDocumentId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--focus-ring)] transition"
              >
                {availableDocs.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Topic Title (e.g., Dependency Injection, K-Means Clustering, OSI Model...)"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--focus-ring)] transition"
              autoFocus
            />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="px-3.5 py-1 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-0.5 flex-wrap text-[var(--text-secondary)] text-xs overflow-x-auto">
          <button
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-[var(--border)] mx-1" />

          <button
            onClick={() => insertFormatting('## ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Heading 2 (## Heading)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('### ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Heading 3 (### Heading)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-[var(--border)] mx-1" />

          <button
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Bullet List (- item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('1. ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Numbered List (1. item)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-[var(--border)] mx-1" />

          <button
            onClick={() => insertFormatting('`', '`')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Inline Code (`code`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('```typescript\n', '\n```')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Fenced Code Block"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('| Header 1 | Header 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |\n')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Insert Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('> [!NOTE]\n> ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Insert Callout Note"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('[Link Title](', ')')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
            title="Insert Link"
          >
            <Link className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editor Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Textarea Area */}
          {(editorMode === 'write' || editorMode === 'split') && (
            <div className={`flex-1 flex flex-col ${editorMode === 'split' ? 'border-r border-[var(--border)]' : ''}`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  setIsDirty(true);
                }}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Type your notes in Markdown syntax..."
                className="flex-1 w-full p-4 bg-[var(--surface)] font-mono text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Area */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--canvas)]">
              <div className="mb-4 pb-2 border-b border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                <span>PREVIEW</span>
                <span className="truncate max-w-[200px]">{title || 'Untitled'}</span>
              </div>
              <div className="max-w-none text-[var(--text-primary)]">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}
        </div>

        {/* Editor Status Bar */}
        <div className="px-4 py-2 bg-[var(--surface-muted)] border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span>{content.length} chars</span>
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            <span>{content.split('\n').length} lines</span>
          </div>
          <span className="hidden sm:inline">Ctrl+S to save &bull; Tab to indent</span>
        </div>
      </div>
    </div>
  );
}

export function NoteEditor() {
  const { isEditorOpen, editingTopic, editorPrefills } = useKnowledge();

  if (!isEditorOpen) return null;

  // Key guarantees clean unmount and fresh state whenever note/prefill changes
  const editorKey = editingTopic ? `edit-${editingTopic.id}` : `new-${editorPrefills?.collectionId || ''}-${editorPrefills?.documentId || ''}`;

  return <NoteEditorInner key={editorKey} />;
}
