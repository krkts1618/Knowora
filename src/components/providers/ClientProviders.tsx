'use client';

import React from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { KnowledgeProvider } from '@/context/knowledge-context';
import { ToastContainer } from '@/components/ui/Toast';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { CreateCollectionDialog } from '@/components/dialogs/CreateCollectionDialog';
import { ImportDocumentDialog } from '@/components/dialogs/ImportDocumentDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { PdfPlaceholderModal } from '@/components/dialogs/PdfPlaceholderModal';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <KnowledgeProvider>
        {children}
        <GlobalSearchModal />
        <NoteEditor />
        <CreateCollectionDialog />
        <ImportDocumentDialog />
        <ConfirmDialog />
        <PdfPlaceholderModal />
        <SettingsDialog />
        <ToastContainer />
      </KnowledgeProvider>
    </ThemeProvider>
  );
}
