'use client';

import React from 'react';
import { useKnowledge } from '@/context/knowledge-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { LibraryDashboard } from '@/components/dashboard/LibraryDashboard';
import { DocumentExplorer } from '@/components/explorer/DocumentExplorer';
import { TopicReader } from '@/components/reader/TopicReader';
import { AllDocumentsView } from '@/components/explorer/AllDocumentsView';
import { Loader2 } from 'lucide-react';

export function MainWorkspace() {
  const { currentView, isLoading } = useKnowledge();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)] antialiased select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--canvas)]">
        {/* Top Bar */}
        <TopBar />

        {/* Dynamic View Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative select-text">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)] text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
                <span>Loading workspace...</span>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && <LibraryDashboard />}
              {(currentView === 'collection' || currentView === 'document') && <DocumentExplorer />}
              {currentView === 'topic' && <TopicReader />}
              {(currentView === 'all-documents' || 
                currentView === 'recent' || 
                currentView === 'bookmarks' || 
                currentView === 'trash') && <AllDocumentsView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
