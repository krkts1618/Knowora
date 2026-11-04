'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useKnowledge } from '@/context/knowledge-context';
import { ThemeMode } from '@/types';
import { 
  Search, 
  Plus, 
  Upload, 
  Menu, 
  ChevronRight, 
  Sun, 
  Moon, 
  Monitor, 
  Settings, 
  Keyboard, 
  RotateCcw
} from 'lucide-react';

export function TopBar() {
  const {
    currentView,
    selectedCollection,
    selectedDocument,
    selectedTopic,
    navigateToDashboard,
    navigateToCollection,
    navigateToDocument,
    openCreateNote,
    setIsImportDialogOpen,
    setIsSearchOpen,
    setIsSettingsOpen,
    setIsMobileSidebarOpen,
    themeMode,
    setThemeMode,
    resolvedTheme,
    resetToMockData,
  } = useKnowledge();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  return (
    <header className="h-11 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-4 flex items-center justify-between gap-3 sticky top-0 z-20 text-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus:outline-none"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] min-w-0 truncate">
          <Link
            href="/dashboard"
            className="hover:text-[var(--text-primary)] transition shrink-0 font-medium"
            title="Dashboard"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
          <button
            onClick={navigateToDashboard}
            className="hover:text-[var(--text-primary)] transition shrink-0 font-medium"
            title="Library"
          >
            Library
          </button>

          {currentView === 'collection' && selectedCollection && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-[200px]">
                {selectedCollection.name}
              </span>
            </>
          )}

          {currentView === 'document' && selectedDocument && (
            <>
              {selectedCollection && (
                <>
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
                  <button
                    onClick={() => navigateToCollection(selectedCollection.id)}
                    className="hover:text-[var(--text-primary)] transition truncate max-w-[100px] sm:max-w-[140px]"
                  >
                    {selectedCollection.name}
                  </button>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)] truncate max-w-[130px] sm:max-w-[180px]">
                {selectedDocument.title}
              </span>
            </>
          )}

          {currentView === 'topic' && selectedTopic && (
            <>
              {selectedCollection && (
                <>
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60 hidden md:block" />
                  <button
                    onClick={() => navigateToCollection(selectedCollection.id)}
                    className="hover:text-[var(--text-primary)] transition truncate max-w-[90px] hidden md:block"
                  >
                    {selectedCollection.name}
                  </button>
                </>
              )}
              {selectedDocument && (
                <>
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
                  <button
                    onClick={() => navigateToDocument(selectedDocument.id)}
                    className="hover:text-[var(--text-primary)] transition truncate max-w-[100px] sm:max-w-[130px]"
                  >
                    {selectedDocument.title}
                  </button>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[180px]">
                {selectedTopic.title}
              </span>
            </>
          )}

          {currentView === 'all-documents' && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)]">All Documents</span>
            </>
          )}

          {currentView === 'recent' && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)]">Recently Opened</span>
            </>
          )}

          {currentView === 'bookmarks' && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)]">Bookmarks</span>
            </>
          )}

          {currentView === 'trash' && (
            <>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              <span className="font-medium text-[var(--text-primary)]">Trash</span>
            </>
          )}
        </nav>
      </div>

      {/* Center: Search Trigger Input */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full h-7 flex items-center justify-between px-2.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition group"
          title="Search knowledge base"
        >
          <div className="flex items-center gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition" />
            <span className="text-[11px]">Search notes, topics, code...</span>
          </div>
          <kbd className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface)] rounded border border-[var(--border)]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions, Theme, and Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Mobile search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="sm:hidden p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Theme Toggle Icon */}
        <button
          suppressHydrationWarning
          onClick={() => {
            if (themeMode === 'light') setThemeMode('dark');
            else if (themeMode === 'dark') setThemeMode('system');
            else setThemeMode('light');
          }}
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          title={`Theme: ${themeMode} (${resolvedTheme}) — Click to cycle`}
          aria-label="Cycle theme"
        >
          {themeMode === 'system' ? (
            <Monitor className="w-3.5 h-3.5" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Import Document Button */}
        <button
          onClick={() => setIsImportDialogOpen(true)}
          className="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition"
          title="Import PDF / TXT"
        >
          <Upload className="w-3 h-3 text-[var(--text-secondary)]" />
          <span className="hidden sm:inline text-[11px]">Import</span>
        </button>

        {/* New Note Button */}
        <button
          onClick={() => openCreateNote()}
          className="h-7 inline-flex items-center gap-1.5 px-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-xs font-medium transition active:scale-98 shadow-xs"
          title="Create a new note"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px]">New Note</span>
        </button>

        {/* User avatar menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[var(--focus-ring)] transition focus:outline-none ml-1"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-primary)]">
              AD
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] py-1.5 text-xs text-[var(--text-primary)] z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="font-semibold text-xs text-[var(--text-primary)]">Alex Dev</p>
                <p className="text-[11px] text-[var(--text-secondary)]">alex@notenest.dev</p>
              </div>

              {/* Theme Segmented Selector inside Menu */}
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  Theme
                </span>
                <div className="grid grid-cols-3 gap-1 bg-[var(--surface-muted)] p-0.5 rounded-md border border-[var(--border)]">
                  {([
                    { mode: 'light' as ThemeMode, label: 'Light', Icon: Sun },
                    { mode: 'dark' as ThemeMode, label: 'Dark', Icon: Moon },
                    { mode: 'system' as ThemeMode, label: 'System', Icon: Monitor },
                  ]).map(({ mode, label, Icon }) => {
                    const isSelected = themeMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setThemeMode(mode)}
                        className={`py-1 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition ${
                          isSelected
                            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2 text-xs"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Workspace Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2 text-xs"
                >
                  <Keyboard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Keyboard Shortcuts (Ctrl+K)</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    resetToMockData();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[var(--surface-hover)] flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Reset Mock Notes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
