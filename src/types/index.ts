export interface Subtopic {
  id: string;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface Topic {
  id: string;
  documentId: string;
  collectionId: string;
  title: string;
  summary: string;
  content: string; // Markdown formatted content
  subtopics?: Subtopic[];
  pageReference?: string; // e.g. "PDF Page 14-16"
  isBookmarked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  collectionId: string;
  title: string;
  description: string;
  type: 'notes' | 'cheatsheet' | 'imported_pdf' | 'imported_txt';
  originalFileName?: string;
  fileSize?: string;
  isBookmarked: boolean;
  isTrash?: boolean;
  createdAt: string;
  updatedAt: string;
  topicIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: 'forest' | 'emerald' | 'amber' | 'cyan' | 'sage' | 'rose' | 'sky' | 'indigo' | 'violet';
  icon: 'book' | 'code' | 'cpu' | 'network' | 'layers' | 'terminal';
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
}

export type ViewType = 
  | 'dashboard'
  | 'collection'
  | 'document'
  | 'topic'
  | 'all-documents'
  | 'recent'
  | 'bookmarks'
  | 'trash';

export type DisplayMode = 'grid' | 'list';

export type SortField = 'updatedAt' | 'title' | 'topicCount';
export type SortDirection = 'asc' | 'desc';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SearchResult {
  id: string;
  type: 'topic' | 'document' | 'collection';
  title: string;
  parentDocumentTitle?: string;
  collectionName?: string;
  collectionColor?: Collection['color'];
  matchedField: 'title' | 'content' | 'description' | 'tags';
  snippet: string;
  targetTopicId?: string;
  targetDocumentId?: string;
  targetCollectionId?: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  summary?: string;
  collectionId: string;
  documentId: string;
  tags?: string[];
  pageReference?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  pageReference?: string;
}

export interface CreateCollectionInput {
  name: string;
  description: string;
  color: Collection['color'];
  icon: Collection['icon'];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description?: string;
}
