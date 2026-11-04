'use client';

import React from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { 
  Search, 
  Plus, 
  Upload, 
  FolderPlus, 
  BookOpen, 
  Code2, 
  Cpu, 
  Network, 
  Layers, 
  Terminal, 
  Clock, 
  FileText, 
  Bookmark, 
  Folder,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  book: BookOpen,
  code: Code2,
  cpu: Cpu,
  network: Network,
  layers: Layers,
  terminal: Terminal,
};

const COLOR_DOTS: Record<string, string> = {
  forest: 'bg-[#1F6B4D] dark:bg-[#72C49A]',
  emerald: 'bg-[#2E7D59]',
  sage: 'bg-[#4F7A65]',
  amber: 'bg-[#946200] dark:bg-[#F0C36A]',
  cyan: 'bg-[#20626B] dark:bg-[#6EC2CE]',
  rose: 'bg-[#9E4D4D] dark:bg-[#FF8A80]',
  sky: 'bg-[#407B8C]',
  indigo: 'bg-[#1F6B4D] dark:bg-[#72C49A]',
  violet: 'bg-[#4F7A65]',
};

export function LibraryDashboard() {
  const {
    collections,
    documents,
    topics,
    recentTopics,
    bookmarkedTopics,
    navigateToCollection,
    navigateToDocument,
    navigateToTopic,
    openCreateNote,
    setIsCreateCollectionOpen,
    setIsImportDialogOpen,
    setIsSearchOpen,
    toggleBookmark,
  } = useKnowledge();

  const activeDocuments = documents.filter(d => !d.isTrash);
  const totalTopics = topics.length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-7 lg:px-10 lg:py-8 space-y-7 max-w-5xl mx-auto w-full text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            Knowledge Library
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Organize study notes, retrieve topic concepts, and review technical summaries.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openCreateNote()}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-xs font-medium transition active:scale-98 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => setIsImportDialogOpen(true)}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setIsCreateCollectionOpen(true)}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Prominent Knowledge Search Bar */}
      <div>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-left group"
        >
          <div className="flex items-center gap-2.5 text-sm">
            <Search className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition" />
            <span>Search topics, code snippets, algorithms, and formulas...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] rounded border border-[var(--border)]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Restrained Stats Strip (Flat horizontal metrics instead of heavy boxed cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-[var(--border)]">
        <div>
          <span className="text-xs text-[var(--text-muted)] block">Collections</span>
          <span className="text-xl font-semibold font-mono text-[var(--text-primary)] mt-0.5 block">
            {collections.length}
          </span>
        </div>

        <div>
          <span className="text-xs text-[var(--text-muted)] block">Documents</span>
          <span className="text-xl font-semibold font-mono text-[var(--text-primary)] mt-0.5 block">
            {activeDocuments.length}
          </span>
        </div>

        <div>
          <span className="text-xs text-[var(--text-muted)] block">Indexed Topics</span>
          <span className="text-xl font-semibold font-mono text-[var(--text-primary)] mt-0.5 block">
            {totalTopics}
          </span>
        </div>

        <div>
          <span className="text-xs text-[var(--text-muted)] block">Bookmarks</span>
          <span className="text-xl font-semibold font-mono text-[var(--text-primary)] mt-0.5 block">
            {bookmarkedTopics.length}
          </span>
        </div>
      </div>

      {/* Recently Opened Topics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Recently Opened Topics
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">1-Click Jump</span>
        </div>

        {recentTopics.length === 0 ? (
          <div className="p-6 rounded-md border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
            No recently opened topics. Click on any topic in the sidebar to begin reading.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentTopics.slice(0, 4).map(topic => {
              const col = collections.find(c => c.id === topic.collectionId);
              const doc = documents.find(d => d.id === topic.documentId);
              const dotColor = COLOR_DOTS[col?.color || 'forest'];

              return (
                <div
                  key={topic.id}
                  onClick={() => navigateToTopic(topic.id)}
                  className="group p-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] cursor-pointer transition flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                          {col?.name || 'General'}
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleBookmark(topic.id, 'topic');
                        }}
                        className={`p-1 rounded hover:bg-[var(--surface-hover)] ${
                          topic.isBookmarked ? 'text-[var(--status-warning)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className="w-3 h-3" fill={topic.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition line-clamp-1">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="truncate max-w-[120px]">{doc?.title}</span>
                    <span className="flex items-center gap-0.5 text-[var(--accent)] font-medium">
                      Open <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Subject Collections Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Subject Collections
            </h2>
          </div>
          <button
            onClick={() => setIsCreateCollectionOpen(true)}
            className="text-xs text-[var(--accent)] hover:underline font-medium"
          >
            + Add Collection
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="p-8 rounded-md border border-dashed border-[var(--border)] text-center space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">No collections created</p>
            <p className="text-xs text-[var(--text-secondary)]">Create a collection to organize your study notes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {collections.map(col => {
              const ColIcon = ICON_MAP[col.icon] || Folder;
              const dotColor = COLOR_DOTS[col.color] || 'bg-[#2E7D59]';
              const colDocs = activeDocuments.filter(d => d.collectionId === col.id);
              const colTopicCount = topics.filter(t => t.collectionId === col.id).length;

              return (
                <div
                  key={col.id}
                  onClick={() => navigateToCollection(col.id)}
                  className="group p-4 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] cursor-pointer transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <ColIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                          {col.name}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {colDocs.length} {colDocs.length === 1 ? 'doc' : 'docs'} &bull; {colTopicCount} topics
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 pl-4">
                      {col.description}
                    </p>
                  </div>

                  {/* Document previews */}
                  <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {colDocs.slice(0, 2).map(d => (
                        <span
                          key={d.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)] truncate max-w-[140px]"
                        >
                          {d.title}
                        </span>
                      ))}
                      {colDocs.length > 2 && (
                        <span className="text-[11px] text-[var(--text-muted)]">
                          +{colDocs.length - 2} more
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-[var(--accent)] font-medium group-hover:underline flex items-center gap-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Documents
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">{activeDocuments.length} total</span>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
          {activeDocuments.map(doc => {
            const col = collections.find(c => c.id === doc.collectionId);
            const docTopics = topics.filter(t => t.documentId === doc.id);
            const dotColor = COLOR_DOTS[col?.color || 'forest'];

            return (
              <div
                key={doc.id}
                onClick={() => navigateToDocument(doc.id)}
                className="p-3 flex items-center justify-between gap-4 hover:bg-[var(--surface-hover)] cursor-pointer transition group text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition truncate">
                        {doc.title}
                      </span>
                      {col && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          <span>{col.name}</span>
                        </span>
                      )}
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {doc.type}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--text-secondary)]">
                  <span className="font-mono text-[11px] text-[var(--text-muted)] hidden sm:inline">
                    {docTopics.length} {docTopics.length === 1 ? 'topic' : 'topics'}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleBookmark(doc.id, 'document');
                    }}
                    className={`p-1 rounded hover:bg-[var(--surface-muted)] ${
                      doc.isBookmarked ? 'text-[var(--status-warning)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Bookmark Document"
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={doc.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
