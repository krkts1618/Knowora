import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  real,
  jsonb,
  uuid,
  index,
  uniqueIndex,
  primaryKey,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// 1. Profiles
export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 2. User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"), // 'light' | 'dark' | 'system'
  editorPreferences: jsonb("editor_preferences").notNull().default({}),
  keyboardShortcuts: jsonb("keyboard_shortcuts").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 3. Folders
export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentFolderId: uuid("parent_folder_id").references((): AnyPgColumn => folders.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("folders_user_id_parent_id_idx").on(table.userId, table.parentFolderId),
  ]
);

// 4. Documents
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    sourceType: text("source_type").notNull().default("manual"), // 'pdf' | 'manual'
    originalFileKey: text("original_file_key"),
    originalFileName: text("original_file_name"),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull().default(0),
    mimeType: text("mime_type"),
    pageCount: integer("page_count").notNull().default(0),
    processingStatus: text("processing_status").notNull().default("completed"), // 'queued' | 'processing' | 'completed' | 'failed'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("documents_user_id_folder_id_idx").on(table.userId, table.folderId),
  ]
);

// 5. Topics
export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    parentTopicId: uuid("parent_topic_id").references((): AnyPgColumn => topics.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    content: jsonb("content").notNull().default({}),
    plainText: text("plain_text").notNull().default(""),
    position: integer("position").notNull().default(0),
    sourcePageStart: integer("source_page_start"),
    sourcePageEnd: integer("source_page_end"),
    origin: text("origin").notNull().default("manual"), // 'manual' | 'extracted'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("topics_doc_id_parent_pos_idx").on(
      table.documentId,
      table.parentTopicId,
      table.position
    ),
    index("topics_user_id_idx").on(table.userId),
  ]
);

// 6. Topic Versions
export const topicVersions = pgTable(
  "topic_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    titleSnapshot: text("title_snapshot").notNull(),
    contentSnapshot: jsonb("content_snapshot").notNull(),
    plainTextSnapshot: text("plain_text_snapshot").notNull().default(""),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("topic_versions_topic_id_version_idx").on(
      table.topicId,
      table.versionNumber
    ),
  ]
);

// 7. Processing Jobs
export const processingJobs = pgTable(
  "processing_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"), // 'queued' | 'processing' | 'review_required' | 'completed' | 'failed'
    currentStage: text("current_stage"),
    progress: integer("progress").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    errorMessage: text("error_message"),
    workerJobId: text("worker_job_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("processing_jobs_user_id_status_idx").on(table.userId, table.status),
  ]
);

// 8. Document Pages
export const documentPages = pgTable(
  "document_pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    extractedText: text("extracted_text"),
    extractionMethod: text("extraction_method"),
    confidence: real("confidence"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("document_pages_document_id_page_idx").on(
      table.documentId,
      table.pageNumber
    ),
  ]
);

// 9. Extraction Drafts
export const extractionDrafts = pgTable("extraction_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  processingJobId: uuid("processing_job_id").references(
    () => processingJobs.id,
    { onDelete: "set null" }
  ),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'discarded'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 10. Extraction Draft Nodes
export const extractionDraftNodes = pgTable(
  "extraction_draft_nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => extractionDrafts.id, { onDelete: "cascade" }),
    parentNodeId: uuid("parent_node_id").references(
      (): AnyPgColumn => extractionDraftNodes.id,
      { onDelete: "cascade" }
    ),
    title: text("title").notNull(),
    content: jsonb("content").notNull().default({}),
    position: integer("position").notNull().default(0),
    sourcePageStart: integer("source_page_start"),
    sourcePageEnd: integer("source_page_end"),
    confidence: real("confidence"),
    isIncluded: boolean("is_included").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("extraction_draft_nodes_draft_pos_idx").on(
      table.draftId,
      table.parentNodeId,
      table.position
    ),
  ]
);

// 11. Storage Objects
export const storageObjects = pgTable(
  "storage_objects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bucketName: text("bucket_name").notNull(),
    objectKey: text("object_key").notNull(),
    objectType: text("object_type").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("storage_objects_bucket_key_idx").on(
      table.bucketName,
      table.objectKey
    ),
  ]
);

// 12. Assets
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
  topicId: uuid("topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  storageObjectId: uuid("storage_object_id")
    .notNull()
    .references(() => storageObjects.id, { onDelete: "cascade" }),
  assetType: text("asset_type").notNull(), // 'image' | 'diagram' | 'chart'
  altText: text("alt_text"),
  pageNumber: integer("page_number"),
  aiDescription: text("ai_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 13. Storage Deletion Jobs
export const storageDeletionJobs = pgTable("storage_deletion_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  storageObjectId: uuid("storage_object_id")
    .notNull()
    .references(() => storageObjects.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 14. Bookmarks
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_id_topic_id_idx").on(
      table.userId,
      table.topicId
    ),
  ]
);

// 15. Tags
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#1F6B4D"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("tags_user_id_name_idx").on(table.userId, table.name),
  ]
);

// 16. Topic Tags
export const topicTags = pgTable(
  "topic_tags",
  {
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.topicId, table.tagId] }),
  ]
);

// 17. Recent Views
export const recentViews = pgTable(
  "recent_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("recent_views_user_id_topic_id_idx").on(
      table.userId,
      table.topicId
    ),
  ]
);

// Export infer types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;

export type TopicVersion = typeof topicVersions.$inferSelect;
export type NewTopicVersion = typeof topicVersions.$inferInsert;

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type NewProcessingJob = typeof processingJobs.$inferInsert;

export type DocumentPage = typeof documentPages.$inferSelect;
export type NewDocumentPage = typeof documentPages.$inferInsert;

export type ExtractionDraft = typeof extractionDrafts.$inferSelect;
export type NewExtractionDraft = typeof extractionDrafts.$inferInsert;

export type ExtractionDraftNode = typeof extractionDraftNodes.$inferSelect;
export type NewExtractionDraftNode = typeof extractionDraftNodes.$inferInsert;

export type StorageObject = typeof storageObjects.$inferSelect;
export type NewStorageObject = typeof storageObjects.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

export type StorageDeletionJob = typeof storageDeletionJobs.$inferSelect;
export type NewStorageDeletionJob = typeof storageDeletionJobs.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type TopicTag = typeof topicTags.$inferSelect;
export type NewTopicTag = typeof topicTags.$inferInsert;

export type RecentView = typeof recentViews.$inferSelect;
export type NewRecentView = typeof recentViews.$inferInsert;
