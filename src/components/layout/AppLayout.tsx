"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "@/components/search/CommandPalette";
import { CreateFolderModal } from "@/components/dialogs/CreateFolderModal";
import { CreateDocumentModal } from "@/components/dialogs/CreateDocumentModal";
import { PdfUploadComingSoonModal } from "@/components/dialogs/PdfUploadComingSoonModal";

export interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  breadcrumbs?: React.ReactNode;
  fullBleed?: boolean;
}

export function AppLayout({ children, user, breadcrumbs, fullBleed = false }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Global event listeners to open modals from anywhere (header, sidebar, command palette, dashboard)
  useEffect(() => {
    const handleOpenCreateFolder = () => setIsCreateFolderOpen(true);
    const handleOpenCreateDocument = () => setIsCreateDocumentOpen(true);
    const handleOpenUploadPdf = () => setIsPdfModalOpen(true);

    window.addEventListener("open-create-folder", handleOpenCreateFolder);
    window.addEventListener("open-create-document", handleOpenCreateDocument);
    window.addEventListener("open-upload-pdf", handleOpenUploadPdf);

    return () => {
      window.removeEventListener("open-create-folder", handleOpenCreateFolder);
      window.removeEventListener("open-create-document", handleOpenCreateDocument);
      window.removeEventListener("open-upload-pdf", handleOpenUploadPdf);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--canvas)] text-[var(--text-primary)] antialiased select-none">
      {/* Sidebar Navigation */}
      <AppSidebar
        user={user}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--canvas)]">
        {/* Top Header */}
        <AppHeader
          user={user}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          breadcrumbs={breadcrumbs}
        />

        {/* Dynamic Page Content Viewport */}
        {fullBleed ? (
          <main className="flex-1 overflow-hidden select-text flex flex-col min-h-0">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 select-text">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        )}
      </div>

      {/* Command Palette Modal */}
      <CommandPalette />

      {/* Quick Action Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
      />

      <CreateDocumentModal
        isOpen={isCreateDocumentOpen}
        onClose={() => setIsCreateDocumentOpen(false)}
      />

      <PdfUploadComingSoonModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
