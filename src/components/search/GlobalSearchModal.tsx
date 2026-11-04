'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { knowledgeService } from '@/lib/knowledge-service';
import { SearchResult } from '@/types';
import { 
  Search, 
  X, 
  FileText, 
  Folder, 
  Hash, 
  CornerDownLeft, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export function GlobalSearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    navigateToTopic,
    navigateToDocument,
    navigateToCollection,
    recentTopics,
  } = useKnowledge();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'topic' | 'document' | 'collection'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, startSearching] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    startSearching(async () => {
      const allResults = await knowledgeService.search(val);
      setResults(allResults);
      setSelectedIndex(0);
    });
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  // Filtered results
  const filteredResults = results.filter(r => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      scrollToIndex(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollToIndex(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredResults[selectedIndex];
      if (current) {
        handleSelectResult(current);
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (!listRef.current) return;
    const elements = listRef.current.querySelectorAll('[data-result-item]');
    if (elements[index]) {
      elements[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setIsSearchOpen(false);
    if (result.type === 'topic' && result.targetTopicId) {
      navigateToTopic(result.targetTopicId);
    } else if (result.type === 'document' && result.targetDocumentId) {
      navigateToDocument(result.targetDocumentId);
    } else if (result.type === 'collection' && result.targetCollectionId) {
      navigateToCollection(result.targetCollectionId);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-3 bg-[var(--surface)]">
          <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search topics, documents, notes, code..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                handleQueryChange('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-muted)] rounded border border-[var(--border)]">
            Esc
          </kbd>
        </div>

        {/* Filter Tabs */}
        {query && results.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs">
            <span className="text-[var(--text-muted)] text-[11px] mr-1">Filter:</span>
            {(['all', 'topic', 'document', 'collection'] as const).map(type => {
              const count = type === 'all' ? results.length : results.filter(r => r.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-0.5 rounded capitalize transition text-xs ${
                    filterType === type
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium border border-[var(--border)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {type === 'all' ? 'All' : type + 's'} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Results Area */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--border-subtle)]">
          {/* Empty Query State: Show Recent Topics and Quick Tips */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Recently Opened Topics</span>
                </p>
                <div className="space-y-0.5">
                  {recentTopics.slice(0, 4).map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigateToTopic(topic.id);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Hash className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition shrink-0" />
                        <span className="text-xs font-medium truncate">{topic.title}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono hidden sm:inline">
                        Jump →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">Instant Full-Text Retrieval</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Search matches topic titles, full study notes content, code examples, and subject tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {query.trim() && isSearching && (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              Searching knowledge library...
            </div>
          )}

          {/* No Results State */}
          {query.trim() && !isSearching && filteredResults.length === 0 && (
            <div className="py-12 px-4 text-center">
              <Search className="w-7 h-7 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                Try searching for topics like &quot;Spring Boot&quot;, &quot;Dependency Injection&quot;, &quot;Linear Regression&quot;, &quot;useEffect&quot;, or &quot;OSI Model&quot;.
              </p>
            </div>
          )}

          {/* Results List */}
          {query.trim() && !isSearching && filteredResults.map((result, idx) => {
            const isSelected = idx === selectedIndex;
            const Icon = 
              result.type === 'topic' ? Hash :
              result.type === 'document' ? FileText : Folder;

            return (
              <div
                key={result.id}
                data-result-item
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 rounded-md cursor-pointer transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[var(--selection)] border border-[var(--border)]'
                    : 'hover:bg-[var(--surface-hover)]/60 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                  isSelected ? 'bg-[var(--surface)] text-[var(--accent)]' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {result.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase font-mono tracking-wider bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
                      {result.type}
                    </span>
                    {result.collectionName && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        in <span className="text-[var(--accent)] font-medium">{result.collectionName}</span>
                      </span>
                    )}
                    {result.parentDocumentTitle && (
                      <span className="text-[10px] text-[var(--text-muted)] truncate">
                        › {result.parentDocumentTitle}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {result.snippet}
                  </p>
                </div>

                <div className="self-center hidden sm:flex items-center text-[var(--text-muted)]">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-[var(--surface-muted)] border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[var(--surface)] rounded text-[9px] border border-[var(--border)] font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 bg-[var(--surface)] rounded text-[9px] border border-[var(--border)] font-mono">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[var(--surface)] rounded text-[9px] border border-[var(--border)] font-mono">Enter</kbd>
              <span>to open</span>
            </span>
          </div>
          <span className="text-[var(--text-muted)] font-mono">
            {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
      </div>
    </div>
  );
}
