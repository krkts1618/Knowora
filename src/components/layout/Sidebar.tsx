'use client';

import React from 'react';
import Link from 'next/link';
import { useKnowledge } from '@/context/knowledge-context';
import { 
  Folder, 
  FileText, 
  Bookmark, 
  Clock, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Code2, 
  Cpu, 
  Network, 
  Layers, 
  Terminal, 
  Settings, 
  X, 
  Hash,
  Library,
  BookMarked,
  LayoutDashboard
} from 'lucide-react';

const ICON_MAP = {
  book: BookOpen,
  code: Code2,
  cpu: Cpu,
  network: Network,
  layers: Layers,
  terminal: Terminal,
};

// Restrained natural color dot indicators for collections
const COLOR_DOTS: Record<string, string> = {
  forest: 'bg-[#1F6B4D] dark:bg-[#72C49A]',
  emerald: 'bg-[#2E7D59]',
  sage: 'bg-[#4F7A65]',
  amber: 'bg-[#946200] dark:bg-[#F0C36A]',
  cyan: 'bg-[#20626B] dark:bg-[#6EC2CE]',
  rose: 'bg-[#9E4D4D] dark:bg-[#FF8A80]',
  sky: 'bg-[#407B8C]',
  // Backward compatibility aliases mapped to forest & sage
  indigo: 'bg-[#1F6B4D] dark:bg-[#72C49A]',
  violet: 'bg-[#4F7A65]',
};

export function Sidebar() {
  const {
    collections,
    documents,
    topics,
    bookmarkedTopics,
    bookmarkedDocuments,
    trashDocuments,
    currentView,
    selectedCollectionId,
    selectedDocumentId,
    selectedTopicId,
    expandedCollectionIds,
    toggleCollectionExpanded,
    expandedDocumentIds,
    toggleDocumentExpanded,
    navigateToDashboard,
    navigateToCollection,
    navigateToDocument,
    navigateToTopic,
    navigateToAllDocuments,
    navigateToRecent,
    navigateToBookmarks,
    navigateToTrash,
    setIsCreateCollectionOpen,
    setIsSettingsOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useKnowledge();

  const totalDocuments = documents.filter(d => !d.isTrash).length;
  const totalBookmarks = bookmarkedTopics.length + bookmarkedDocuments.length;

  const content = (
    <div className="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] text-[var(--text-secondary)] select-none text-xs">
      {/* Brand Header */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-[var(--border)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-left group focus:outline-none rounded-md py-1"
        >
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] shadow-xs">
            <BookMarked className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs tracking-tight text-[var(--text-primary)]">
              NoteNest
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              v1.0
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="px-2 pt-2.5 pb-1 space-y-0.5">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Dashboard</span>
          </div>
        </Link>

        <button
          onClick={navigateToDashboard}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs ${
            currentView === 'dashboard'
              ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Library className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Library</span>
          </div>
        </button>

        <button
          onClick={navigateToAllDocuments}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs ${
            currentView === 'all-documents'
              ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>All Documents</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {totalDocuments}
          </span>
        </button>

        <button
          onClick={navigateToRecent}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs ${
            currentView === 'recent'
              ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Recently Opened</span>
          </div>
        </button>

        <button
          onClick={navigateToBookmarks}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs ${
            currentView === 'bookmarks'
              ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Bookmarks</span>
          </div>
          {totalBookmarks > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {totalBookmarks}
            </span>
          )}
        </button>

        <button
          onClick={navigateToTrash}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-xs ${
            currentView === 'trash'
              ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Trash</span>
          </div>
          {trashDocuments.length > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {trashDocuments.length}
            </span>
          )}
        </button>
      </div>

      {/* Collections Section Header */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between border-t border-[var(--border-subtle)] mt-1">
        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Collections
        </span>
        <button
          onClick={() => setIsCreateCollectionOpen(true)}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          title="New Collection"
          aria-label="New Collection"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hierarchical Collections Tree */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
        {collections.map(col => {
          const isExpanded = expandedCollectionIds.has(col.id);
          const isSelected = currentView === 'collection' && selectedCollectionId === col.id;
          const ColIcon = ICON_MAP[col.icon] || Folder;
          const dotColor = COLOR_DOTS[col.color] || 'bg-[#2E7D59]';
          const colDocs = documents.filter(d => d.collectionId === col.id && !d.isTrash);

          return (
            <div key={col.id} className="space-y-0.5">
              {/* Collection Item */}
              <div
                className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition ${
                  isSelected
                    ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleCollectionExpanded(col.id);
                  }}
                  className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded"
                  aria-label={isExpanded ? 'Collapse collection' : 'Expand collection'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={() => navigateToCollection(col.id)}
                  className="flex-1 flex items-center gap-2 text-left truncate"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                  <ColIcon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{col.name}</span>
                </button>

                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {colDocs.length}
                </span>
              </div>

              {/* Nested Documents */}
              {isExpanded && (
                <div className="pl-3.5 ml-2 border-l border-[var(--border-subtle)] space-y-0.5">
                  {colDocs.length === 0 ? (
                    <p className="text-[11px] text-[var(--text-muted)] py-1 pl-2 italic">
                      No documents
                    </p>
                  ) : (
                    colDocs.map(doc => {
                      const isDocExpanded = expandedDocumentIds.has(doc.id);
                      const isDocSelected =
                        currentView === 'document' && selectedDocumentId === doc.id;
                      const docTopics = topics.filter(t => t.documentId === doc.id);

                      return (
                        <div key={doc.id} className="space-y-0.5">
                          {/* Document Item */}
                          <div
                            className={`group flex items-center gap-1.5 px-1.5 py-1 rounded-md transition ${
                              isDocSelected
                                ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleDocumentExpanded(doc.id);
                              }}
                              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded"
                              aria-label={isDocExpanded ? 'Collapse topics' : 'Expand topics'}
                            >
                              {isDocExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>

                            <button
                              onClick={() => navigateToDocument(doc.id)}
                              className="flex-1 flex items-center gap-1.5 text-left truncate"
                            >
                              <FileText className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                              <span className="truncate text-xs">{doc.title}</span>
                            </button>

                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              {docTopics.length}
                            </span>
                          </div>

                          {/* Nested Topics */}
                          {isDocExpanded && (
                            <div className="pl-3 ml-1.5 border-l border-[var(--border-subtle)] space-y-0.5">
                              {docTopics.length === 0 ? (
                                <p className="text-[10px] text-[var(--text-muted)] py-0.5 pl-1 italic">
                                  No topics
                                </p>
                              ) : (
                                docTopics.map(topic => {
                                  const isTopicSelected =
                                    currentView === 'topic' && selectedTopicId === topic.id;

                                  return (
                                    <button
                                      key={topic.id}
                                      onClick={() => navigateToTopic(topic.id)}
                                      className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left transition truncate ${
                                        isTopicSelected
                                          ? 'bg-[var(--selection)] text-[var(--text-primary)] font-medium'
                                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                                      }`}
                                    >
                                      <Hash className={`w-2.5 h-2.5 shrink-0 ${isTopicSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                                      <span className="truncate text-[11px]">
                                        {topic.title}
                                      </span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer controls & User profile */}
      <div className="p-2.5 border-t border-[var(--border)] bg-[var(--sidebar)] space-y-1.5">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
        >
          <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>Settings</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pt-1.5 border-t border-[var(--border-subtle)] px-1">
          <div className="w-6 h-6 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center font-medium text-[10px] text-[var(--text-primary)] shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">Alex Dev</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight">alex@notenest.dev</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-150">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
