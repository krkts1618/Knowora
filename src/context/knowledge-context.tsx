'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Collection, 
  DocumentItem, 
  Topic, 
  ViewType, 
  DisplayMode, 
  SortField, 
  SortDirection, 
  ToastNotification,
  CreateCollectionInput,
  ThemeMode
} from '@/types';
import { knowledgeService } from '@/lib/knowledge-service';
import { INITIAL_COLLECTIONS, INITIAL_DOCUMENTS, INITIAL_TOPICS } from '@/lib/mock-data';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface KnowledgeContextType {
  // Data
  collections: Collection[];
  documents: DocumentItem[];
  topics: Topic[];
  recentTopics: Topic[];
  bookmarkedTopics: Topic[];
  bookmarkedDocuments: DocumentItem[];
  trashDocuments: DocumentItem[];
  isLoading: boolean;

  // Active View & Selection
  currentView: ViewType;
  selectedCollectionId: string | null;
  selectedDocumentId: string | null;
  selectedTopicId: string | null;
  selectedCollection: Collection | null;
  selectedDocument: DocumentItem | null;
  selectedTopic: Topic | null;

  // Document Explorer Controls
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (dir: SortDirection) => void;
  filterQuery: string;
  setFilterQuery: (q: string) => void;

  // Sidebar Controls
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expandedCollectionIds: Set<string>;
  toggleCollectionExpanded: (id: string) => void;
  expandedDocumentIds: Set<string>;
  toggleDocumentExpanded: (id: string) => void;

  // Dialog & Modal States
  isCreateCollectionOpen: boolean;
  setIsCreateCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPdfModalOpen: boolean;
  pdfModalTopic: Topic | null;
  openPdfModal: (topic: Topic) => void;
  closePdfModal: () => void;
  confirmDialog: ConfirmDialogState | null;
  closeConfirm: () => void;
  askConfirmation: (config: Omit<ConfirmDialogState, 'isOpen'>) => void;

  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';

  // Note Editor State
  isEditorOpen: boolean;
  editingTopic: Topic | null;
  editorPrefills: { collectionId: string; documentId: string } | null;
  openCreateNote: (prefill?: { collectionId?: string; documentId?: string }) => void;
  openEditTopic: (topic: Topic) => void;
  closeEditor: () => void;

  // Navigation
  navigateToDashboard: () => void;
  navigateToCollection: (colId: string) => void;
  navigateToDocument: (docId: string) => void;
  navigateToTopic: (topicId: string) => void;
  navigateToAllDocuments: () => void;
  navigateToRecent: () => void;
  navigateToBookmarks: () => void;
  navigateToTrash: () => void;

  // Actions
  toggleBookmark: (id: string, type: 'topic' | 'document') => Promise<void>;
  saveNote: (data: { title: string; content: string; collectionId: string; documentId: string; topicId?: string }) => Promise<Topic>;
  deleteTopic: (topicId: string) => Promise<void>;
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  renameDocument: (id: string, newTitle: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  importMockFiles: (files: { name: string; size: number }[], collectionId: string) => Promise<void>;
  resetToMockData: () => void;

  // Toasts
  toasts: ToastNotification[];
  showToast: (type: ToastNotification['type'], message: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [recentTopicIds, setRecentTopicIds] = useState<string[]>([
    'topic-spring-di',
    'topic-ml-logistic-reg',
    'topic-react-use-effect',
    'topic-net-error-detection'
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Explorer options
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterQuery, setFilterQuery] = useState('');

  // Sidebar expand / collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedCollectionIds, setExpandedCollectionIds] = useState<Set<string>>(new Set(['col-java', 'col-ml', 'col-web', 'col-networks']));
  const [expandedDocumentIds, setExpandedDocumentIds] = useState<Set<string>>(new Set(['doc-spring-boot', 'doc-ml-revision', 'doc-react-notes', 'doc-net-fundamentals']));

  // Modals
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalTopic, setPdfModalTopic] = useState<Topic | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Theme Mode
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notenest_theme_mode') as ThemeMode | null;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored;
        }
      } catch {}
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notenest_theme_mode') as ThemeMode | null;
        const mode = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return (mode === 'dark' || (mode === 'system' && isSystemDark)) ? 'dark' : 'light';
      } catch {}
    }
    return 'dark';
  });

  // Listen to OS color-scheme changes when in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        const isDark = e.matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('notenest_theme_mode', mode);
    } catch {}
    if (typeof window !== 'undefined') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = mode === 'dark' || (mode === 'system' && isSystemDark);
      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editorPrefills, setEditorPrefills] = useState<{ collectionId: string; documentId: string } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((type: ToastNotification['type'], message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Reload all data from service
  const reloadData = useCallback(async () => {
    try {
      const [cols, docs, tops] = await Promise.all([
        knowledgeService.getCollections(),
        knowledgeService.getDocuments(),
        knowledgeService.getTopics(),
      ]);
      setCollections(cols);
      setDocuments(docs);
      setTopics(tops);
      setRecentTopicIds(knowledgeService.getRecentTopicIds());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Derived properties
  const selectedCollection = useMemo(() => {
    return collections.find(c => c.id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  const selectedDocument = useMemo(() => {
    return documents.find(d => d.id === selectedDocumentId) || null;
  }, [documents, selectedDocumentId]);

  const selectedTopic = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId) || null;
  }, [topics, selectedTopicId]);

  const recentTopics = useMemo(() => {
    return recentTopicIds
      .map(id => topics.find(t => t.id === id))
      .filter((t): t is Topic => Boolean(t));
  }, [recentTopicIds, topics]);

  const bookmarkedTopics = useMemo(() => {
    return topics.filter(t => t.isBookmarked);
  }, [topics]);

  const bookmarkedDocuments = useMemo(() => {
    return documents.filter(d => d.isBookmarked && !d.isTrash);
  }, [documents]);

  const trashDocuments = useMemo(() => {
    return documents.filter(d => d.isTrash);
  }, [documents]);

  // Expand / collapse helpers
  const toggleCollectionExpanded = useCallback((id: string) => {
    setExpandedCollectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleDocumentExpanded = useCallback((id: string) => {
    setExpandedDocumentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Navigation handlers
  const navigateToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setSelectedCollectionId(null);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateToCollection = useCallback((colId: string) => {
    setCurrentView('collection');
    setSelectedCollectionId(colId);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setFilterQuery('');
    setExpandedCollectionIds(prev => new Set(prev).add(colId));
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateToDocument = useCallback((docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setCurrentView('document');
    setSelectedDocumentId(docId);
    if (doc) {
      setSelectedCollectionId(doc.collectionId);
      setExpandedCollectionIds(prev => new Set(prev).add(doc.collectionId));
      setExpandedDocumentIds(prev => new Set(prev).add(docId));
    }
    setSelectedTopicId(null);
    setIsMobileSidebarOpen(false);
  }, [documents]);

  const navigateToTopic = useCallback((topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    knowledgeService.recordTopicVisit(topicId);
    setRecentTopicIds(knowledgeService.getRecentTopicIds());

    setCurrentView('topic');
    setSelectedTopicId(topicId);
    setSelectedDocumentId(topic.documentId);
    setSelectedCollectionId(topic.collectionId);

    setExpandedCollectionIds(prev => new Set(prev).add(topic.collectionId));
    setExpandedDocumentIds(prev => new Set(prev).add(topic.documentId));
    setIsMobileSidebarOpen(false);
  }, [topics]);

  const navigateToAllDocuments = useCallback(() => {
    setCurrentView('all-documents');
    setSelectedCollectionId(null);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setFilterQuery('');
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateToRecent = useCallback(() => {
    setCurrentView('recent');
    setSelectedCollectionId(null);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateToBookmarks = useCallback(() => {
    setCurrentView('bookmarks');
    setSelectedCollectionId(null);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateToTrash = useCallback(() => {
    setCurrentView('trash');
    setSelectedCollectionId(null);
    setSelectedDocumentId(null);
    setSelectedTopicId(null);
    setIsMobileSidebarOpen(false);
  }, []);

  // PDF Modal
  const openPdfModal = useCallback((topic: Topic) => {
    setPdfModalTopic(topic);
    setIsPdfModalOpen(true);
  }, []);

  const closePdfModal = useCallback(() => {
    setIsPdfModalOpen(false);
    setPdfModalTopic(null);
  }, []);

  // Confirmation modal
  const askConfirmation = useCallback((config: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...config, isOpen: true });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  // Editor handlers
  const openCreateNote = useCallback((prefill?: { collectionId?: string; documentId?: string }) => {
    const targetColId = prefill?.collectionId || selectedCollectionId || (collections[0]?.id || '');
    const candidateDocs = documents.filter(d => d.collectionId === targetColId && !d.isTrash);
    const targetDocId = prefill?.documentId || selectedDocumentId || (candidateDocs[0]?.id || documents[0]?.id || '');

    setEditingTopic(null);
    setEditorPrefills({
      collectionId: targetColId,
      documentId: targetDocId,
    });
    setIsEditorOpen(true);
  }, [selectedCollectionId, selectedDocumentId, collections, documents]);

  const openEditTopic = useCallback((topic: Topic) => {
    setEditingTopic(topic);
    setEditorPrefills({
      collectionId: topic.collectionId,
      documentId: topic.documentId,
    });
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingTopic(null);
    setEditorPrefills(null);
  }, []);

  // Data Actions
  const toggleBookmark = useCallback(async (id: string, type: 'topic' | 'document') => {
    const newState = await knowledgeService.toggleBookmark(id, type);
    await reloadData();
    showToast(
      'info',
      newState ? 'Added to Bookmarks' : 'Removed from Bookmarks',
      type === 'topic' ? 'Study topic bookmark updated' : 'Document bookmark updated'
    );
  }, [reloadData, showToast]);

  const saveNote = useCallback(async (data: {
    title: string;
    content: string;
    collectionId: string;
    documentId: string;
    topicId?: string;
  }): Promise<Topic> => {
    let savedTopic: Topic;

    if (data.topicId) {
      // Update
      savedTopic = await knowledgeService.updateTopic(data.topicId, {
        title: data.title,
        content: data.content,
      });
      showToast('success', 'Topic Updated', `Changes saved to "${savedTopic.title}"`);
    } else {
      // Create new
      savedTopic = await knowledgeService.createTopic({
        title: data.title,
        content: data.content,
        collectionId: data.collectionId,
        documentId: data.documentId,
      });
      showToast('success', 'Note Created', `Topic added to document notes`);
    }

    await reloadData();
    closeEditor();
    navigateToTopic(savedTopic.id);
    return savedTopic;
  }, [reloadData, closeEditor, navigateToTopic, showToast]);

  const deleteTopic = useCallback(async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    const parentDocId = topic?.documentId;
    await knowledgeService.deleteTopic(topicId);
    await reloadData();
    showToast('info', 'Topic Deleted', `Removed "${topic?.title || 'topic'}"`);

    if (selectedTopicId === topicId) {
      if (parentDocId) {
        navigateToDocument(parentDocId);
      } else {
        navigateToDashboard();
      }
    }
  }, [topics, selectedTopicId, reloadData, showToast, navigateToDocument, navigateToDashboard]);

  const createCollection = useCallback(async (input: CreateCollectionInput): Promise<Collection> => {
    const newCol = await knowledgeService.createCollection(input);
    await reloadData();
    showToast('success', 'Collection Created', `Created "${newCol.name}" subject collection`);
    navigateToCollection(newCol.id);
    return newCol;
  }, [reloadData, showToast, navigateToCollection]);

  const deleteCollection = useCallback(async (id: string) => {
    const col = collections.find(c => c.id === id);
    await knowledgeService.deleteCollection(id);
    await reloadData();
    showToast('info', 'Collection Deleted', `Deleted "${col?.name || 'collection'}"`);
    if (selectedCollectionId === id) {
      navigateToDashboard();
    }
  }, [collections, selectedCollectionId, reloadData, showToast, navigateToDashboard]);

  const renameDocument = useCallback(async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    await knowledgeService.updateDocument(id, { title: newTitle.trim() });
    await reloadData();
    showToast('success', 'Document Renamed', `Renamed to "${newTitle.trim()}"`);
  }, [reloadData, showToast]);

  const deleteDocument = useCallback(async (id: string) => {
    const doc = documents.find(d => d.id === id);
    await knowledgeService.deleteDocument(id, true);
    await reloadData();
    showToast('info', 'Moved to Trash', `"${doc?.title || 'Document'}" moved to trash`);
    if (selectedDocumentId === id) {
      if (doc?.collectionId) {
        navigateToCollection(doc.collectionId);
      } else {
        navigateToDashboard();
      }
    }
  }, [documents, selectedDocumentId, reloadData, showToast, navigateToCollection, navigateToDashboard]);

  const restoreDocument = useCallback(async (id: string) => {
    await knowledgeService.updateDocument(id, { isTrash: false });
    await reloadData();
    showToast('success', 'Document Restored', 'Document restored from trash');
  }, [reloadData, showToast]);

  const importMockFiles = useCallback(async (
    files: { name: string; size: number }[],
    collectionId: string
  ) => {
    for (const f of files) {
      const isPdf = f.name.toLowerCase().endsWith('.pdf');
      const doc = await knowledgeService.createDocument(collectionId, {
        title: f.name.replace(/\.[^/.]+$/, ''),
        description: `Imported local ${isPdf ? 'PDF study material' : 'TXT note source'}. (Phase 3 will automatically extract topics and retain original PDF).`,
        type: isPdf ? 'imported_pdf' : 'imported_txt',
        originalFileName: f.name,
        fileSize: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      });

      // Create an initial starter topic inside the newly imported document
      await knowledgeService.createTopic({
        collectionId,
        documentId: doc.id,
        title: `${doc.title} - Extracted Topics Overview`,
        summary: `Imported document summary ready for note taking and topic structuring.`,
        content: `## ${doc.title}

> [!NOTE]
> **Source File**: \`${f.name}\` (${(f.size / (1024 * 1024)).toFixed(1)} MB)
> **Phase 3 Preview**: In Phase 3, NoteNest's ingestion engine will automatically extract semantic topics, generate code blocks, and establish page-level links to your original PDF in secure cloud storage.

### Getting Started with this Document
You can now add manual topic notes, synthesize lecture highlights, or prepare study revisions under this document. Use the **Edit Note** or **New Note** buttons at any time.`,
        tags: ['Imported', isPdf ? 'PDF' : 'TXT'],
      });
    }

    await reloadData();
    showToast('success', 'Documents Imported', `Successfully added ${files.length} document(s) to collection.`);
    setIsImportDialogOpen(false);
  }, [reloadData, showToast]);

  const resetToMockData = useCallback(() => {
    knowledgeService.resetAllData();
    reloadData();
    navigateToDashboard();
    showToast('info', 'Reset Complete', 'Restored default study notes & collections.');
  }, [reloadData, navigateToDashboard, showToast]);

  const value = {
    collections,
    documents,
    topics,
    recentTopics,
    bookmarkedTopics,
    bookmarkedDocuments,
    trashDocuments,
    isLoading,

    currentView,
    selectedCollectionId,
    selectedDocumentId,
    selectedTopicId,
    selectedCollection,
    selectedDocument,
    selectedTopic,

    displayMode,
    setDisplayMode,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filterQuery,
    setFilterQuery,

    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    expandedCollectionIds,
    toggleCollectionExpanded,
    expandedDocumentIds,
    toggleDocumentExpanded,

    isCreateCollectionOpen,
    setIsCreateCollectionOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    isSearchOpen,
    setIsSearchOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isPdfModalOpen,
    pdfModalTopic,
    openPdfModal,
    closePdfModal,
    confirmDialog,
    closeConfirm,
    askConfirmation,

    themeMode,
    setThemeMode,
    resolvedTheme,

    isEditorOpen,
    editingTopic,
    editorPrefills,
    openCreateNote,
    openEditTopic,
    closeEditor,

    navigateToDashboard,
    navigateToCollection,
    navigateToDocument,
    navigateToTopic,
    navigateToAllDocuments,
    navigateToRecent,
    navigateToBookmarks,
    navigateToTrash,

    toggleBookmark,
    saveNote,
    deleteTopic,
    createCollection,
    deleteCollection,
    renameDocument,
    deleteDocument,
    restoreDocument,
    importMockFiles,
    resetToMockData,

    toasts,
    showToast,
    dismissToast,
  };

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
