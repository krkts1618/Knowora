'use client';

import React, { useState } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { DocumentItem, SortField } from '@/types';
import { 
  FileText, 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  MoreVertical, 
  Bookmark, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Hash, 
  ArrowRight, 
  Upload,
  ArrowUpDown
} from 'lucide-react';

export function DocumentExplorer() {
  const {
    selectedCollection,
    documents,
    topics,
    displayMode,
    setDisplayMode,
    sortField,
    setSortField,
    filterQuery,
    setFilterQuery,
    navigateToDocument,
    navigateToTopic,
    openCreateNote,
    setIsImportDialogOpen,
    toggleBookmark,
    renameDocument,
    deleteDocument,
    deleteCollection,
    askConfirmation,
  } = useKnowledge();

  const [expandedDocIds, setExpandedDocIds] = useState<Set<string>>(new Set());
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  if (!selectedCollection) return null;

  const collectionDocs = documents.filter(
    d => d.collectionId === selectedCollection.id && !d.isTrash
  );

  // Filter docs by query
  const filteredDocs = collectionDocs.filter(d => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  // Sort docs
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortField === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortField === 'topicCount') {
      const aCount = topics.filter(t => t.documentId === a.id).length;
      const bCount = topics.filter(t => t.documentId === b.id).length;
      return bCount - aCount;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const toggleDocExpand = (docId: string) => {
    setExpandedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleStartRename = (doc: DocumentItem) => {
    setRenamingDocId(doc.id);
    setRenameValue(doc.title);
    setActiveMenuDocId(null);
  };

  const handleSaveRename = (docId: string) => {
    if (renameValue.trim()) {
      renameDocument(docId, renameValue.trim());
    }
    setRenamingDocId(null);
  };

  const handleDeleteDoc = (doc: DocumentItem) => {
    setActiveMenuDocId(null);
    askConfirmation({
      title: 'Move Document to Trash?',
      message: `Move "${doc.title}" to trash? Associated topics will also be archived.`,
      confirmLabel: 'Move to Trash',
      danger: true,
      onConfirm: () => deleteDocument(doc.id),
    });
  };

  const handleDeleteCol = () => {
    askConfirmation({
      title: 'Delete Subject Collection?',
      message: `Delete "${selectedCollection.name}"? All documents and topics inside this collection will be permanently removed.`,
      confirmLabel: 'Delete Collection',
      danger: true,
      onConfirm: () => deleteCollection(selectedCollection.id),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-7 lg:px-10 lg:py-8 space-y-6 max-w-5xl mx-auto w-full text-[var(--text-primary)]">
      {/* Collection Header */}
      <div className="p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]">
              Collection
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {collectionDocs.length} {collectionDocs.length === 1 ? 'Document' : 'Documents'}
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {selectedCollection.name}
          </h1>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {selectedCollection.description}
          </p>
        </div>

        {/* Collection Actions */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => openCreateNote({ collectionId: selectedCollection.id })}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-xs font-medium transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>

          <button
            onClick={() => setIsImportDialogOpen(true)}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Import</span>
          </button>

          <button
            onClick={handleDeleteCol}
            className="h-8 px-2.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--status-error)] transition"
            title="Delete Collection"
            aria-label="Delete Collection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toolbar: Filter, Sorting, View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Filter documents..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--focus-ring)] transition"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
              <option value="topicCount">Topic Count</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md bg-[var(--surface-muted)] border border-[var(--border)] p-0.5">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-1 rounded ${displayMode === 'grid' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-1 rounded ${displayMode === 'list' ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sortedDocs.length === 0 && (
        <div className="py-14 text-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 space-y-2.5">
          <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-xs font-semibold text-[var(--text-primary)]">
            {filterQuery ? 'No matching documents' : 'No documents in this collection'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {filterQuery
              ? `No document matches the filter "${filterQuery}". Clear the search to view all.`
              : 'Add your first study document or import a PDF/TXT to begin organizing topics.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => openCreateNote({ collectionId: selectedCollection.id })}
              className="px-3 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-xs font-medium"
            >
              Create Note
            </button>
            <button
              onClick={() => setIsImportDialogOpen(true)}
              className="px-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-medium"
            >
              Import File
            </button>
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {displayMode === 'grid' && sortedDocs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedDocs.map(doc => {
            const docTopics = topics.filter(t => t.documentId === doc.id);
            const isExpanded = expandedDocIds.has(doc.id);
            const isRenaming = renamingDocId === doc.id;
            const isMenuOpen = activeMenuDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition flex flex-col justify-between relative group"
              >
                <div className="p-4 space-y-2.5">
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {doc.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(doc.id, 'document')}
                        className={`p-1 rounded hover:bg-[var(--surface-hover)] transition ${
                          doc.isBookmarked ? 'text-[var(--status-warning)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                        title="Bookmark Document"
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={doc.isBookmarked ? 'currentColor' : 'none'} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuDocId(isMenuOpen ? null : doc.id)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                          aria-label="Document options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-32 rounded-md bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] py-1 text-xs text-[var(--text-primary)] z-20">
                            <button
                              onClick={() => handleStartRename(doc)}
                              className="w-full px-2.5 py-1 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3 text-[var(--text-muted)]" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc)}
                              className="w-full px-2.5 py-1 text-left hover:bg-[var(--surface-hover)] text-[var(--status-error)] flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Rename Mode */}
                  {isRenaming ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        className="flex-1 bg-[var(--surface-muted)] border border-[var(--accent)] rounded px-2 py-0.5 text-xs text-[var(--text-primary)]"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(doc.id)}
                        className="px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setRenamingDocId(null)}
                        className="px-2 py-0.5 bg-[var(--surface-muted)] rounded text-xs text-[var(--text-secondary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateToDocument(doc.id)}
                      className="text-left w-full group/title"
                    >
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover/title:text-[var(--accent)] transition">
                        {doc.title}
                      </h3>
                    </button>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Topics count & Expand outline toggle */}
                  <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
                    <span className="font-mono text-[10px]">
                      {docTopics.length} {docTopics.length === 1 ? 'Topic' : 'Topics'}
                    </span>

                    {docTopics.length > 0 && (
                      <button
                        onClick={() => toggleDocExpand(doc.id)}
                        className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5 font-medium"
                      >
                        <span>Outline</span>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Nested Topics Outline Dropdown */}
                  {isExpanded && (
                    <div className="pt-1.5 space-y-0.5 border-t border-[var(--border-subtle)]">
                      {docTopics.map(topic => (
                        <button
                          key={topic.id}
                          onClick={() => navigateToTopic(topic.id)}
                          className="w-full flex items-center justify-between p-1 rounded hover:bg-[var(--surface-hover)] text-left text-xs text-[var(--text-secondary)] group/topic transition"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Hash className="w-3 h-3 text-[var(--text-muted)] group-hover/topic:text-[var(--accent)] shrink-0" />
                            <span className="truncate text-xs">{topic.title}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">Read &rarr;</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Open Document */}
                <div className="p-2.5 bg-[var(--surface-muted)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigateToDocument(doc.id)}
                    className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Mode */}
      {displayMode === 'list' && sortedDocs.length > 0 && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] overflow-hidden divide-y divide-[var(--border)]">
          {sortedDocs.map(doc => {
            const docTopics = topics.filter(t => t.documentId === doc.id);
            const isRenaming = renamingDocId === doc.id;
            const isExpanded = expandedDocIds.has(doc.id);

            return (
              <div key={doc.id} className="p-3 hover:bg-[var(--surface-hover)] transition space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleDocExpand(doc.id)}
                      className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label="Toggle topic outline"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            className="bg-[var(--surface-muted)] border border-[var(--accent)] rounded px-2 py-0.5 text-xs text-[var(--text-primary)]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(doc.id)}
                            className="px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setRenamingDocId(null)}
                            className="px-2 py-0.5 bg-[var(--surface-muted)] rounded text-xs text-[var(--text-secondary)]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigateToDocument(doc.id)}
                          className="text-left font-medium text-xs text-[var(--text-primary)] hover:text-[var(--accent)] transition truncate block"
                        >
                          {doc.title}
                        </button>
                      )}
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] shrink-0">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] hidden sm:inline">
                      {docTopics.length} topics
                    </span>
                    <button
                      onClick={() => toggleBookmark(doc.id, 'document')}
                      className={`p-1 rounded hover:bg-[var(--surface-muted)] ${
                        doc.isBookmarked ? 'text-[var(--status-warning)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={doc.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleStartRename(doc)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--surface-muted)]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded outline row in list view */}
                {isExpanded && (
                  <div className="pl-6 pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 border-t border-[var(--border-subtle)]">
                    {docTopics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => navigateToTopic(topic.id)}
                        className="flex items-center gap-1.5 p-1.5 rounded bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] group/topic transition"
                      >
                        <Hash className="w-3 h-3 text-[var(--text-muted)] group-hover/topic:text-[var(--accent)] shrink-0" />
                        <span className="truncate text-xs">{topic.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
