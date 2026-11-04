'use client';

import React, { useState } from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { ThemeMode } from '@/types';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  RotateCcw, 
  Download, 
  Check
} from 'lucide-react';

export function SettingsDialog() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    themeMode,
    setThemeMode,
    resolvedTheme,
    collections,
    documents,
    topics,
    resetToMockData,
    showToast,
  } = useKnowledge();

  const [activeTab, setActiveTab] = useState<'appearance' | 'shortcuts' | 'data'>('appearance');

  if (!isSettingsOpen) return null;

  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      collections,
      documents,
      topics,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notenest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Exported', 'Saved local workspace JSON file');
  };

  const handleReset = () => {
    resetToMockData();
    setIsSettingsOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-modal)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Workspace Settings
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Preferences, appearance, shortcuts, and study datasets
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-[var(--border)] flex gap-4 text-xs font-medium bg-[var(--surface-muted)]">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'appearance'
                ? 'border-[var(--accent)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'shortcuts'
                ? 'border-[var(--accent)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'data'
                ? 'border-[var(--accent)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Data & Backup
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Interface Theme
                </label>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3">
                  Select your preferred workspace color theme or synchronize with your operating system.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { mode: 'light' as ThemeMode, label: 'Light', icon: Sun, desc: '#F4F7F3 natural canvas' },
                    { mode: 'dark' as ThemeMode, label: 'Dark', icon: Moon, desc: '#000000 OLED black' },
                    { mode: 'system' as ThemeMode, label: 'System', icon: Monitor, desc: `Currently ${resolvedTheme}` },
                  ]).map(({ mode, label, icon: Icon, desc }) => {
                    const isSelected = themeMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setThemeMode(mode)}
                        className={`p-3 rounded-md border text-left flex flex-col justify-between transition ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--surface-muted)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[var(--text-primary)]">{label}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)]">
                <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] space-y-1">
                  <p className="font-medium text-[var(--text-primary)] text-xs">Forest Focus Aesthetic</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Designed with natural warm off-white surfaces, true OLED-black dark layers, balanced typography, and low-contrast borders for sustained reading and technical focus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <p className="text-[11px] text-[var(--text-secondary)]">
                Quick keyboard interactions for rapid study note retrieval and editing.
              </p>
              <div className="rounded-md border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
                {[
                  { key: 'Ctrl + K  /  ⌘K', action: 'Open Global Search' },
                  { key: 'Ctrl + S  /  ⌘S', action: 'Save current note in Editor' },
                  { key: 'Esc', action: 'Close modals, drawers, and search' },
                  { key: '↑ / ↓', action: 'Navigate search results and lists' },
                  { key: 'Enter', action: 'Open highlighted search result' },
                  { key: 'Tab', action: 'Insert 2-space indentation in editor' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{item.action}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-primary)]">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Workspace Statistics
                </p>
                <div className="grid grid-cols-3 gap-2.5 mt-2">
                  <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-secondary)] block">Collections</span>
                    <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{collections.length}</span>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-secondary)] block">Documents</span>
                    <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{documents.length}</span>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-secondary)] block">Topics</span>
                    <span className="text-lg font-bold font-mono text-[var(--text-primary)]">{topics.length}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs text-[var(--text-primary)]">Export Workspace JSON</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">Download all collections, documents, and notes as structured JSON.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-medium text-xs flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <div>
                    <p className="font-semibold text-xs text-[var(--text-primary)]">Reset to Sample Study Notes</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">Restore original Java, ML, Web, and Networks study notes.</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--status-error)] font-medium text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="text-[11px] font-mono">Phase 1 &bull; Supabase Storage in Phase 2</span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-3 py-1.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
