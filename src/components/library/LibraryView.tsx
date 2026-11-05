"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Folder,
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  ArrowLeft,
  Home,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { FolderCard, FolderCardData } from "./FolderCard";
import { DocumentCard, DocumentCardData } from "./DocumentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateFolderModal } from "@/components/dialogs/CreateFolderModal";
import { CreateDocumentModal } from "@/components/dialogs/CreateDocumentModal";
import { RenameFolderModal } from "./RenameFolderModal";
import { MoveFolderModal, FolderItem } from "./MoveFolderModal";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { EditDocumentModal } from "./EditDocumentModal";
import { MoveDocumentModal } from "./MoveDocumentModal";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";

export interface BreadcrumbNode {
  id?: string;
  name: string;
  href?: string;
}

export interface LibraryViewProps {
  currentFolder?: FolderItem | null;
  breadcrumbPath: BreadcrumbNode[];
  initialFolders: FolderCardData[];
  initialDocuments: DocumentCardData[];
  allFolders: FolderItem[];
}

type SortOption = "name-asc" | "name-desc" | "updated-desc" | "created-desc";
type FilterOption = "all" | "folders" | "documents" | "manual" | "pdf";

export function LibraryView({
  currentFolder,
  breadcrumbPath,
  initialFolders,
  initialDocuments,
  allFolders,
}: LibraryViewProps) {
  const router = useRouter();

  // Local state
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    try {
      return (localStorage.getItem("notenest_library_view") as "grid" | "list") || "grid";
    } catch {
      return "grid";
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const [parentForNewSubfolder, setParentForNewSubfolder] = useState<string | null>(null);

  const [folderToRename, setFolderToRename] = useState<FolderCardData | null>(null);
  const [folderToMove, setFolderToMove] = useState<FolderCardData | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderCardData | null>(null);

  const [docToEdit, setDocToEdit] = useState<DocumentCardData | null>(null);
  const [docToMove, setDocToMove] = useState<DocumentCardData | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentCardData | null>(null);

  // Toggle and persist view mode
  const handleToggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("notenest_library_view", mode);
    } catch {}
  };

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Client-side filtering & sorting of current view records
  const filteredFolders = useMemo(() => {
    if (filterBy === "documents" || filterBy === "manual" || filterBy === "pdf") {
      return [];
    }

    let result = [...initialFolders];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "updated-desc") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [initialFolders, searchQuery, sortBy, filterBy]);

  const filteredDocuments = useMemo(() => {
    if (filterBy === "folders") {
      return [];
    }

    let result = [...initialDocuments];

    if (filterBy === "manual") {
      result = result.filter((d) => d.sourceType === "manual");
    } else if (filterBy === "pdf") {
      result = result.filter((d) => d.sourceType === "pdf");
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      if (sortBy === "updated-desc") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [initialDocuments, searchQuery, sortBy, filterBy]);

  const totalItemsCount = filteredFolders.length + filteredDocuments.length;

  // Build folder lookup map for folder location names
  const folderNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of allFolders) {
      map.set(f.id, f.name);
    }
    return map;
  }, [allFolders]);

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Dynamic Breadcrumbs */}
      <nav
        aria-label="Breadcrumb navigation"
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0"
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors shrink-0"
          title="Dashboard"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>
        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
        <Link
          href="/library"
          className={`hover:text-[var(--text-primary)] transition-colors shrink-0 font-medium ${
            !currentFolder ? "text-[var(--text-primary)] font-semibold" : ""
          }`}
        >
          My Library
        </Link>

        {breadcrumbPath.map((node, index) => {
          const isLast = index === breadcrumbPath.length - 1;
          return (
            <React.Fragment key={node.id || index}>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
                  {node.name}
                </span>
              ) : (
                <Link
                  href={node.href || `/library/folders/${node.id}`}
                  className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
                >
                  {node.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {currentFolder && (
              <button
                type="button"
                onClick={() => router.back()}
                className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {currentFolder ? currentFolder.name : "My Library"}
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {currentFolder
              ? `Browse and manage contents of ${currentFolder.name}`
              : "Organize your study notes, nested folders, and document workspaces"}
          </p>
        </div>

        {/* Action Buttons (Matches Screen 2) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setParentForNewSubfolder(currentFolder?.id || null);
              setIsCreateFolderOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{currentFolder ? "New Subfolder" : "New Folder"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-upload-pdf"))}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Upload PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateDocumentOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Library..."
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right Controls: Filters, Sorting, Grid/List Toggle */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-0.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] ml-2" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="bg-transparent text-xs text-[var(--text-secondary)] focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="all">All Content</option>
              <option value="folders">Folders Only</option>
              <option value="documents">Documents Only</option>
              <option value="manual">Manual Notes</option>
              <option value="pdf">PDF Docs</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-0.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] ml-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-[var(--text-secondary)] focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="updated-desc">Recently Updated</option>
              <option value="created-desc">Recently Created</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleToggleViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {totalItemsCount === 0 ? (
        <EmptyState
          icon={searchQuery ? Search : Folder}
          title={
            searchQuery
              ? `No matching results for "${searchQuery}"`
              : currentFolder
              ? "This folder is empty"
              : "Your library is empty"
          }
          description={
            searchQuery
              ? "Try refining your search keyword or clearing filters."
              : currentFolder
              ? "Create subfolders or documents inside this collection to get started."
              : "Create your first folder or document to organize study topics and notes."
          }
          action={
            searchQuery
              ? {
                  label: "Clear Search",
                  onClick: () => setSearchQuery(""),
                }
              : {
                  label: "Create Document",
                  onClick: () => setIsCreateDocumentOpen(true),
                  icon: Plus,
                }
          }
          secondaryAction={
            searchQuery
              ? undefined
              : {
                  label: currentFolder ? "Create Subfolder" : "Create Folder",
                  onClick: () => {
                    setParentForNewSubfolder(currentFolder?.id || null);
                    setIsCreateFolderOpen(true);
                  },
                }
          }
          className="my-8"
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Folders
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
                    {filteredFolders.length}
                  </span>
                </div>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "flex flex-col gap-2"
                }
              >
                {filteredFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    viewMode={viewMode}
                    onRename={setFolderToRename}
                    onMove={setFolderToMove}
                    onDelete={setFolderToDelete}
                    onCreateSubfolder={(f) => {
                      setParentForNewSubfolder(f.id);
                      setIsCreateFolderOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {filteredDocuments.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Documents
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
                    {filteredDocuments.length}
                  </span>
                </div>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "flex flex-col gap-2"
                }
              >
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    folderName={doc.folderId ? folderNameMap.get(doc.folderId) : undefined}
                    viewMode={viewMode}
                    onEdit={setDocToEdit}
                    onMove={setDocToMove}
                    onDelete={setDocToDelete}
                  />
                ))}

                {viewMode === "grid" && (
                  <button
                    type="button"
                    onClick={() => setIsCreateDocumentOpen(true)}
                    className="p-5 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]/40 transition-all flex flex-col items-center justify-center gap-2 text-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer min-h-[140px] group"
                    title="Create new document"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-colors flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-xs">Create Document</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modals */}
      <CreateFolderModal
        initialParentFolderId={parentForNewSubfolder}
        isOpen={isCreateFolderOpen}
        onClose={() => {
          setIsCreateFolderOpen(false);
          setParentForNewSubfolder(null);
        }}
        onSuccess={handleRefresh}
      />

      <CreateDocumentModal
        initialFolderId={currentFolder?.id || null}
        isOpen={isCreateDocumentOpen}
        onClose={() => setIsCreateDocumentOpen(false)}
        onSuccess={handleRefresh}
      />

      <RenameFolderModal
        folder={folderToRename}
        isOpen={Boolean(folderToRename)}
        onClose={() => setFolderToRename(null)}
        onSuccess={handleRefresh}
      />

      <MoveFolderModal
        folder={folderToMove}
        allFolders={allFolders}
        isOpen={Boolean(folderToMove)}
        onClose={() => setFolderToMove(null)}
        onSuccess={handleRefresh}
      />

      <DeleteFolderDialog
        folder={folderToDelete}
        isOpen={Boolean(folderToDelete)}
        onClose={() => setFolderToDelete(null)}
        onSuccess={handleRefresh}
      />

      <EditDocumentModal
        document={docToEdit}
        isOpen={Boolean(docToEdit)}
        onClose={() => setDocToEdit(null)}
        onSuccess={handleRefresh}
      />

      <MoveDocumentModal
        document={docToMove}
        allFolders={allFolders}
        isOpen={Boolean(docToMove)}
        onClose={() => setDocToMove(null)}
        onSuccess={handleRefresh}
      />

      <DeleteDocumentDialog
        document={docToDelete}
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
