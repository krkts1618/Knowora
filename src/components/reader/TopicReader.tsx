'use client';

import React, { useState, useMemo } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { MarkdownRenderer, extractHeadings } from './MarkdownRenderer';
import { 
  Bookmark, 
  Edit3, 
  FileText, 
  Share2, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  ExternalLink, 
  Hash, 
  MoreVertical, 
  BookOpen, 
  Download, 
  Sparkles
} from 'lucide-react';

export function TopicReader() {
  const {
    selectedTopic,
    selectedDocument,
    selectedCollection,
    topics,
    navigateToTopic,
    navigateToDocument,
    openEditTopic,
    openPdfModal,
    toggleBookmark,
    deleteTopic,
    askConfirmation,
    showToast,
  } = useKnowledge();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Sibling topics in current parent document
  const siblingTopics = useMemo(() => {
    if (!selectedDocument) return [];
    return topics.filter(t => t.documentId === selectedDocument.id);
  }, [topics, selectedDocument]);

  const currentIndex = useMemo(() => {
    if (!selectedTopic) return -1;
    return siblingTopics.findIndex(t => t.id === selectedTopic.id);
  }, [siblingTopics, selectedTopic]);

  const prevTopic = currentIndex > 0 ? siblingTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex !== -1 && currentIndex < siblingTopics.length - 1 ? siblingTopics[currentIndex + 1] : null;

  // Headings outline extracted from content
  const headings = useMemo(() => {
    if (!selectedTopic) return [];
    return extractHeadings(selectedTopic.content);
  }, [selectedTopic]);

  if (!selectedTopic) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-[var(--canvas)]">
        <div className="max-w-md space-y-3">
          <BookOpen className="w-9 h-9 text-[var(--text-muted)] mx-auto" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">No topic selected</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Select a topic from the sidebar or document explorer to begin reading.
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setIsMoreMenuOpen(false);
    askConfirmation({
      title: 'Delete Study Topic?',
      message: `Are you sure you want to delete "${selectedTopic.title}"? This note will be removed from your document.`,
      confirmLabel: 'Delete Topic',
      danger: true,
      onConfirm: () => deleteTopic(selectedTopic.id),
    });
  };

  const handleCopyLink = async () => {
    setIsMoreMenuOpen(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Link Copied', 'Topic URL copied to clipboard');
    } catch {
      showToast('info', 'Topic Link', selectedTopic.title);
    }
  };

  const handleExportMarkdown = () => {
    setIsMoreMenuOpen(false);
    const blob = new Blob([selectedTopic.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTopic.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Exported Note', 'Downloaded markdown note file');
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full bg-[var(--canvas)]">
      {/* Main Reading Column */}
      <main className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-8 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header & Meta */}
          <div className="space-y-3 pb-5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Back to document link */}
              {selectedDocument && (
                <button
                  onClick={() => navigateToDocument(selectedDocument.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
                  <span>Back to {selectedDocument.title} {selectedCollection ? `(${selectedCollection.name})` : ''}</span>
                </button>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Bookmark Toggle */}
                <button
                  onClick={() => toggleBookmark(selectedTopic.id, 'topic')}
                  className={`p-1.5 rounded-md border transition ${
                    selectedTopic.isBookmarked
                      ? 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--status-warning)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                  title={selectedTopic.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  aria-label="Bookmark topic"
                >
                  <Bookmark
                    className="w-3.5 h-3.5"
                    fill={selectedTopic.isBookmarked ? 'currentColor' : 'none'}
                  />
                </button>

                {/* View Original PDF Action */}
                <button
                  onClick={() => openPdfModal(selectedTopic)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition"
                  title="View original PDF page sync (Phase 3 preview)"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="hidden sm:inline">View PDF sync</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                {/* Edit Note Button */}
                <button
                  onClick={() => openEditTopic(selectedTopic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-xs font-medium transition shadow-xs"
                  title="Edit this note"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Note</span>
                </button>

                {/* More Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMoreMenuOpen(prev => !prev)}
                    className="p-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 rounded-md bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] py-1 text-xs text-[var(--text-primary)] z-30">
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>
                      <button
                        onClick={handleExportMarkdown}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export as Markdown</span>
                      </button>
                      <div className="border-t border-[var(--border)] my-1" />
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--surface-hover)] text-[var(--status-error)] flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Topic</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Topic Title (24-28px, weight 650) */}
            <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
              {selectedTopic.title}
            </h1>

            {/* Sub-meta and tags */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs text-[var(--text-muted)] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Updated {new Date(selectedTopic.updatedAt).toLocaleDateString()}</span>
              </span>

              {selectedTopic.pageReference && (
                <span className="px-2 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px]">
                  {selectedTopic.pageReference}
                </span>
              )}

              {selectedTopic.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Notice for PDF integration status */}
            <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">
                  Source: <strong className="text-[var(--text-primary)] font-medium">{selectedDocument?.originalFileName || selectedDocument?.title}</strong>
                </span>
              </div>
              <button
                onClick={() => openPdfModal(selectedTopic)}
                className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] shrink-0 font-medium flex items-center gap-1 ml-2"
              >
                <span>Preview PDF Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <article className="max-w-none text-[var(--text-primary)]">
            <MarkdownRenderer content={selectedTopic.content} />
          </article>

          {/* Prev / Next Topic Navigation Footer */}
          <div className="pt-6 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prevTopic ? (
              <button
                onClick={() => navigateToTopic(prevTopic.id)}
                className="p-3.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-left transition group"
              >
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono mb-1">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition" />
                  <span>Previous Topic</span>
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition truncate">
                  {prevTopic.title}
                </p>
              </button>
            ) : <div />}

            {nextTopic && (
              <button
                onClick={() => navigateToTopic(nextTopic.id)}
                className="p-3.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-right transition group ml-auto w-full"
              >
                <div className="flex items-center justify-end gap-1 text-[11px] text-[var(--text-muted)] font-mono mb-1">
                  <span>Next Topic</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition truncate">
                  {nextTopic.title}
                </p>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Desktop Sticky Table of Contents & Sibling Outline */}
      <aside className="hidden xl:flex flex-col w-60 shrink-0 border-l border-[var(--border)] bg-[var(--canvas)] p-4 space-y-5 overflow-y-auto text-xs">
        {/* Outline Section */}
        {headings.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              On this page
            </p>
            <nav className="space-y-0.5">
              {headings.map((h, idx) => (
                <a
                  key={idx}
                  href={`#${h.id}`}
                  className={`block py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition truncate ${
                    h.level === 3 ? 'pl-2.5 text-[11px]' : 'font-medium'
                  }`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Sibling Document Topics */}
        {siblingTopics.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-[var(--border)]">
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Document Topics ({siblingTopics.length})
            </p>
            <div className="space-y-0.5">
              {siblingTopics.map(t => {
                const isSelected = t.id === selectedTopic.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigateToTopic(t.id)}
                    className={`w-full text-left p-1.5 rounded-md transition flex items-center gap-1.5 truncate ${
                      isSelected
                        ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Hash className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate text-xs">{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
