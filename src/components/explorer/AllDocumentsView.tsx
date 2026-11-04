'use client';

import React, { useState } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { DocumentItem } from '@/types';
import { 
  FileText, 
  Bookmark, 
  Trash2, 
  RotateCcw, 
  ArrowRight, 
  Search, 
  Clock, 
  LayoutGrid,
  List
} from 'lucide-react';

export function AllDocumentsView() {
  const {
    currentView,
    documents,
    collections,
    topics,
    bookmarkedDocuments,
    bookmarkedTopics,
    trashDocuments,
    recentTopics,
    displayMode,
    setDisplayMode,
    navigateToDocument,
    navigateToTopic,
    toggleBookmark,
    restoreDocument,
    deleteDocument,
    askConfirmation,
  } = useKnowledge();

  const [filterQuery, setFilterQuery] = useState('');

  // Determine view header
  let title = 'All Documents';
  let subtitle = 'All study guides, notes, and imported materials across all subject collections.';
  let targetDocs: DocumentItem[] = [];

  if (currentView === 'all-documents') {
    title = 'All Documents';
    subtitle = 'Comprehensive list of documents across your subject collections.';
    targetDocs = documents.filter(d => !d.isTrash);
  } else if (currentView === 'bookmarks') {
    title = 'Bookmarks';
    subtitle = 'Quick access to your starred study topics and reference documents.';
    targetDocs = bookmarkedDocuments;
  } else if (currentView === 'recent') {
    title = 'Recently Opened';
    subtitle = 'Recently accessed study topics and working files.';
    targetDocs = documents.filter(d => !d.isTrash);
  } else if (currentView === 'trash') {
    title = 'Trash';
    subtitle = 'Archived documents. You can restore them or permanently delete them.';
    targetDocs = trashDocuments;
  }

  const filteredDocs = targetDocs.filter(d => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  const handlePermanentDelete = (docId: string, docTitle: string) => {
    askConfirmation({
      title: 'Permanently Delete Document?',
      message: `"${docTitle}" and its topics will be permanently deleted from your local workspace. This action cannot be undone.`,
      confirmLabel: 'Permanently Delete',
      danger: true,
      onConfirm: () => deleteDocument(docId),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-7 lg:px-10 lg:py-8 space-y-6 max-w-5xl mx-auto w-full text-[var(--text-primary)]">
      {/* View Header */}
      <div className="p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]">
              View
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {filteredDocs.length} {filteredDocs.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Bookmarks Section: Bookmarked Topics */}
      {currentView === 'bookmarks' && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[var(--status-warning)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Bookmarked Topics ({bookmarkedTopics.length})
            </h2>
          </div>

          {bookmarkedTopics.length === 0 ? (
            <div className="p-6 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] text-center text-xs text-[var(--text-muted)]">
              No bookmarked topics yet. Click the bookmark icon on any topic in the reader to pin it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookmarkedTopics.map(topic => {
                const doc = documents.find(d => d.id === topic.documentId);
                const col = collections.find(c => c.id === topic.collectionId);

                return (
                  <div
                    key={topic.id}
                    onClick={() => navigateToTopic(topic.id)}
                    className="p-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] cursor-pointer transition flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {col?.name || 'General'}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleBookmark(topic.id, 'topic');
                          }}
                          className="p-1 rounded text-[var(--status-warning)] hover:bg-[var(--surface-hover)]"
                        >
                          <Bookmark className="w-3.5 h-3.5" fill="currentColor" />
                        </button>
                      </div>
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition mt-1">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="truncate max-w-[140px]">{doc?.title}</span>
                      <span className="text-[var(--accent)] font-medium group-hover:underline">Read &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Recent Topics Section */}
      {currentView === 'recent' && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Recently Visited Topics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTopics.map(topic => {
              const doc = documents.find(d => d.id === topic.documentId);
              const col = collections.find(c => c.id === topic.collectionId);

              return (
                <div
                  key={topic.id}
                  onClick={() => navigateToTopic(topic.id)}
                  className="p-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] cursor-pointer transition flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] block">
                      {col?.name} &rsaquo; {doc?.title}
                    </span>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition mt-1">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Topic</span>
                    <span className="text-[var(--accent)] font-medium group-hover:underline">Jump to topic &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter and View toolbar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search in this view..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--focus-ring)]"
          />
        </div>

        <div className="flex items-center rounded-md bg-[var(--surface-muted)] border border-[var(--border)] p-0.5">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-1 rounded ${displayMode === 'grid' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-1 rounded ${displayMode === 'list' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Grid / List */}
      {filteredDocs.length === 0 ? (
        <div className="py-14 text-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 space-y-1.5">
          <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <p className="text-xs font-semibold text-[var(--text-primary)]">No documents found</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {currentView === 'trash' ? 'Trash is currently empty.' : 'No documents matching criteria.'}
          </p>
        </div>
      ) : displayMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDocs.map(doc => {
            const col = collections.find(c => c.id === doc.collectionId);
            const docTopics = topics.filter(t => t.documentId === doc.id);

            return (
              <div
                key={doc.id}
                className="p-4 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {col?.name || 'Subject'}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase">
                      {doc.type}
                    </span>
                  </div>

                  <h3
                    onClick={() => !doc.isTrash && navigateToDocument(doc.id)}
                    className={`text-xs font-semibold text-[var(--text-primary)] ${
                      !doc.isTrash ? 'hover:text-[var(--accent)] cursor-pointer' : ''
                    } transition`}
                  >
                    {doc.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-mono text-[10px]">{docTopics.length} topics</span>

                  {currentView === 'trash' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => restoreDocument(doc.id)}
                        className="px-2 py-0.5 rounded bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--status-success)] flex items-center gap-1 text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(doc.id, doc.title)}
                        className="p-1 rounded hover:bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--status-error)]"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateToDocument(doc.id)}
                      className="text-[var(--accent)] hover:underline flex items-center gap-0.5 font-medium text-xs"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden divide-y divide-[var(--border)]">
          {filteredDocs.map(doc => {
            const col = collections.find(c => c.id === doc.collectionId);
            const docTopics = topics.filter(t => t.documentId === doc.id);

            return (
              <div key={doc.id} className="p-3 flex items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => !doc.isTrash && navigateToDocument(doc.id)}
                      className={`font-semibold text-xs text-[var(--text-primary)] ${
                        !doc.isTrash ? 'hover:text-[var(--accent)] cursor-pointer' : ''
                      } truncate`}
                    >
                      {doc.title}
                    </span>
                    {col && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {col.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                    {doc.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-xs">
                  <span className="font-mono text-[10px] text-[var(--text-muted)] hidden sm:inline">
                    {docTopics.length} topics
                  </span>

                  {currentView === 'trash' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => restoreDocument(doc.id)}
                        className="px-2 py-0.5 rounded bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--status-success)] flex items-center gap-1 text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(doc.id, doc.title)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--status-error)]"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateToDocument(doc.id)}
                      className="text-[var(--accent)] hover:underline flex items-center gap-0.5"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
