import { 
  Collection, 
  DocumentItem, 
  Topic, 
  SearchResult, 
  CreateNoteInput, 
  UpdateNoteInput, 
  CreateCollectionInput 
} from '@/types';
import { INITIAL_COLLECTIONS, INITIAL_DOCUMENTS, INITIAL_TOPICS } from './mock-data';

const STORAGE_KEYS = {
  COLLECTIONS: 'notenest_collections_v1',
  DOCUMENTS: 'notenest_documents_v1',
  TOPICS: 'notenest_topics_v1',
  RECENT_TOPICS: 'notenest_recent_topics_v1',
};

class LocalKnowledgeRepository {
  private collections: Collection[] = [];
  private documents: DocumentItem[] = [];
  private topics: Topic[] = [];
  private recentTopicIds: string[] = [];
  private isInitialized = false;

  constructor() {
    // Lazy initialized on first client call
  }

  private init() {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') {
      this.collections = [...INITIAL_COLLECTIONS];
      this.documents = [...INITIAL_DOCUMENTS];
      this.topics = [...INITIAL_TOPICS];
      this.recentTopicIds = ['topic-spring-di', 'topic-ml-logistic-reg', 'topic-react-use-effect', 'topic-net-error-detection'];
      this.isInitialized = true;
      return;
    }

    try {
      const storedCols = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
      const storedRecents = localStorage.getItem(STORAGE_KEYS.RECENT_TOPICS);

      this.collections = storedCols ? JSON.parse(storedCols) : [...INITIAL_COLLECTIONS];
      this.documents = storedDocs ? JSON.parse(storedDocs) : [...INITIAL_DOCUMENTS];
      this.topics = storedTopics ? JSON.parse(storedTopics) : [...INITIAL_TOPICS];
      this.recentTopicIds = storedRecents ? JSON.parse(storedRecents) : [
        'topic-spring-di', 
        'topic-ml-logistic-reg', 
        'topic-react-use-effect', 
        'topic-net-error-detection'
      ];

      // Migrate any legacy purple/indigo collection colors to forest/sage
      this.collections = this.collections.map(c => ({
        ...c,
        color: (c.color === 'indigo' ? 'forest' : c.color === 'violet' ? 'sage' : c.color) as Collection['color']
      }));
    } catch {
      this.collections = [...INITIAL_COLLECTIONS];
      this.documents = [...INITIAL_DOCUMENTS];
      this.topics = [...INITIAL_TOPICS];
      this.recentTopicIds = ['topic-spring-di', 'topic-ml-logistic-reg', 'topic-react-use-effect', 'topic-net-error-detection'];
    }

    this.isInitialized = true;
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(this.collections));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(this.topics));
      localStorage.setItem(STORAGE_KEYS.RECENT_TOPICS, JSON.stringify(this.recentTopicIds));
    } catch (err) {
      console.warn('Failed to persist to localStorage', err);
    }
  }

  // --- COLLECTIONS ---
  async getCollections(): Promise<Collection[]> {
    this.init();
    return [...this.collections];
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    this.init();
    return this.collections.find(c => c.id === id) || null;
  }

  async createCollection(input: CreateCollectionInput): Promise<Collection> {
    this.init();
    const existing = this.collections.find(
      c => c.name.trim().toLowerCase() === input.name.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`A collection named "${input.name.trim()}" already exists.`);
    }

    const newCol: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      description: input.description.trim() || 'No description provided.',
      color: input.color || 'forest',
      icon: input.icon || 'book',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentIds: [],
    };

    this.collections.unshift(newCol);
    this.persist();
    return newCol;
  }

  async deleteCollection(id: string): Promise<boolean> {
    this.init();
    const colIndex = this.collections.findIndex(c => c.id === id);
    if (colIndex === -1) return false;

    // Delete or unbind associated documents
    this.documents = this.documents.filter(d => d.collectionId !== id);
    this.topics = this.topics.filter(t => t.collectionId !== id);
    this.collections.splice(colIndex, 1);
    this.persist();
    return true;
  }

  // --- DOCUMENTS ---
  async getDocuments(collectionId?: string): Promise<DocumentItem[]> {
    this.init();
    let docs = this.documents.filter(d => !d.isTrash);
    if (collectionId) {
      docs = docs.filter(d => d.collectionId === collectionId);
    }
    return [...docs];
  }

  async getDocumentById(id: string): Promise<DocumentItem | null> {
    this.init();
    return this.documents.find(d => d.id === id) || null;
  }

  async createDocument(
    collectionId: string, 
    data: { title: string; description?: string; type?: DocumentItem['type']; originalFileName?: string; fileSize?: string }
  ): Promise<DocumentItem> {
    this.init();
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      collectionId,
      title: data.title.trim(),
      description: data.description?.trim() || 'Study document notes',
      type: data.type || 'notes',
      originalFileName: data.originalFileName,
      fileSize: data.fileSize,
      isBookmarked: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topicIds: [],
    };

    this.documents.unshift(newDoc);
    const col = this.collections.find(c => c.id === collectionId);
    if (col) {
      col.documentIds.unshift(newDoc.id);
      col.updatedAt = new Date().toISOString();
    }
    this.persist();
    return newDoc;
  }

  async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    this.init();
    const doc = this.documents.find(d => d.id === id);
    if (!doc) throw new Error(`Document not found: ${id}`);

    Object.assign(doc, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return doc;
  }

  async deleteDocument(id: string, moveToTrash = true): Promise<boolean> {
    this.init();
    const doc = this.documents.find(d => d.id === id);
    if (!doc) return false;

    if (moveToTrash && !doc.isTrash) {
      doc.isTrash = true;
      doc.updatedAt = new Date().toISOString();
    } else {
      // Permanent removal
      this.documents = this.documents.filter(d => d.id !== id);
      this.topics = this.topics.filter(t => t.documentId !== id);
      const col = this.collections.find(c => c.id === doc.collectionId);
      if (col) {
        col.documentIds = col.documentIds.filter(docId => docId !== id);
      }
    }

    this.persist();
    return true;
  }

  // --- TOPICS ---
  async getTopics(documentId?: string): Promise<Topic[]> {
    this.init();
    if (documentId) {
      return this.topics.filter(t => t.documentId === documentId);
    }
    return [...this.topics];
  }

  async getTopicById(id: string): Promise<Topic | null> {
    this.init();
    const topic = this.topics.find(t => t.id === id);
    if (topic) {
      this.recordTopicVisit(id);
    }
    return topic || null;
  }

  async createTopic(input: CreateNoteInput): Promise<Topic> {
    this.init();
    const newTopic: Topic = {
      id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      documentId: input.documentId,
      collectionId: input.collectionId,
      title: input.title.trim(),
      summary: input.summary?.trim() || input.content.slice(0, 140).replace(/#|`|\*/g, '') + '...',
      content: input.content,
      isBookmarked: false,
      tags: input.tags || ['User Note'],
      pageReference: input.pageReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.topics.unshift(newTopic);

    // Update parent doc
    const doc = this.documents.find(d => d.id === input.documentId);
    if (doc) {
      doc.topicIds.unshift(newTopic.id);
      doc.updatedAt = new Date().toISOString();
    }

    this.recordTopicVisit(newTopic.id);
    this.persist();
    return newTopic;
  }

  async updateTopic(id: string, input: UpdateNoteInput): Promise<Topic> {
    this.init();
    const topic = this.topics.find(t => t.id === id);
    if (!topic) throw new Error(`Topic not found: ${id}`);

    if (input.title !== undefined) topic.title = input.title.trim();
    if (input.content !== undefined) {
      topic.content = input.content;
      if (!input.summary) {
        topic.summary = input.content.slice(0, 140).replace(/#|`|\*/g, '') + '...';
      }
    }
    if (input.summary !== undefined) topic.summary = input.summary.trim();
    if (input.tags !== undefined) topic.tags = input.tags;
    if (input.pageReference !== undefined) topic.pageReference = input.pageReference;
    topic.updatedAt = new Date().toISOString();

    const doc = this.documents.find(d => d.id === topic.documentId);
    if (doc) {
      doc.updatedAt = new Date().toISOString();
    }

    this.persist();
    return topic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    this.init();
    const index = this.topics.findIndex(t => t.id === id);
    if (index === -1) return false;

    const topic = this.topics[index];
    this.topics.splice(index, 1);

    const doc = this.documents.find(d => d.id === topic.documentId);
    if (doc) {
      doc.topicIds = doc.topicIds.filter(tId => tId !== id);
      doc.updatedAt = new Date().toISOString();
    }

    this.recentTopicIds = this.recentTopicIds.filter(tId => tId !== id);
    this.persist();
    return true;
  }

  async toggleBookmark(id: string, type: 'topic' | 'document'): Promise<boolean> {
    this.init();
    if (type === 'topic') {
      const topic = this.topics.find(t => t.id === id);
      if (!topic) return false;
      topic.isBookmarked = !topic.isBookmarked;
      this.persist();
      return topic.isBookmarked;
    } else {
      const doc = this.documents.find(d => d.id === id);
      if (!doc) return false;
      doc.isBookmarked = !doc.isBookmarked;
      this.persist();
      return doc.isBookmarked;
    }
  }

  recordTopicVisit(topicId: string) {
    this.recentTopicIds = [topicId, ...this.recentTopicIds.filter(id => id !== topicId)].slice(0, 8);
    this.persist();
  }

  getRecentTopicIds(): string[] {
    this.init();
    return [...this.recentTopicIds];
  }

  // --- SEARCH ---
  async search(query: string): Promise<SearchResult[]> {
    this.init();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Search Topics
    for (const topic of this.topics) {
      const doc = this.documents.find(d => d.id === topic.documentId);
      const col = this.collections.find(c => c.id === topic.collectionId);

      const titleMatch = topic.title.toLowerCase().includes(q);
      const contentIndex = topic.content.toLowerCase().indexOf(q);
      const tagMatch = topic.tags.some(tag => tag.toLowerCase().includes(q));

      if (titleMatch || contentIndex !== -1 || tagMatch) {
        let snippet = topic.summary;
        let matchedField: SearchResult['matchedField'] = 'content';

        if (titleMatch) {
          matchedField = 'title';
        } else if (contentIndex !== -1) {
          const start = Math.max(0, contentIndex - 40);
          const end = Math.min(topic.content.length, contentIndex + q.length + 60);
          snippet = (start > 0 ? '...' : '') + topic.content.substring(start, end).replace(/\n/g, ' ') + '...';
        } else if (tagMatch) {
          matchedField = 'tags';
          snippet = `Matched in tags: ${topic.tags.join(', ')}`;
        }

        results.push({
          id: `search-topic-${topic.id}`,
          type: 'topic',
          title: topic.title,
          parentDocumentTitle: doc?.title || 'Unknown Document',
          collectionName: col?.name || 'General',
          collectionColor: col?.color || 'forest',
          matchedField,
          snippet,
          targetTopicId: topic.id,
          targetDocumentId: topic.documentId,
          targetCollectionId: topic.collectionId,
        });
      }
    }

    // Search Documents
    for (const doc of this.documents.filter(d => !d.isTrash)) {
      const col = this.collections.find(c => c.id === doc.collectionId);
      if (doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q)) {
        results.push({
          id: `search-doc-${doc.id}`,
          type: 'document',
          title: doc.title,
          collectionName: col?.name || 'General',
          collectionColor: col?.color || 'forest',
          matchedField: doc.title.toLowerCase().includes(q) ? 'title' : 'description',
          snippet: doc.description,
          targetDocumentId: doc.id,
          targetCollectionId: doc.collectionId,
        });
      }
    }

    // Search Collections
    for (const col of this.collections) {
      if (col.name.toLowerCase().includes(q) || col.description.toLowerCase().includes(q)) {
        results.push({
          id: `search-col-${col.id}`,
          type: 'collection',
          title: col.name,
          collectionName: col.name,
          collectionColor: col.color,
          matchedField: col.name.toLowerCase().includes(q) ? 'title' : 'description',
          snippet: col.description,
          targetCollectionId: col.id,
        });
      }
    }

    return results;
  }

  resetAllData() {
    this.collections = [...INITIAL_COLLECTIONS];
    this.documents = [...INITIAL_DOCUMENTS];
    this.topics = [...INITIAL_TOPICS];
    this.recentTopicIds = ['topic-spring-di', 'topic-ml-logistic-reg', 'topic-react-use-effect', 'topic-net-error-detection'];
    this.persist();
  }
}

export const knowledgeService = new LocalKnowledgeRepository();
