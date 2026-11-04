import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import {
  profiles,
  userPreferences,
  folders,
  documents,
  topics,
  topicVersions,
  processingJobs,
  documentPages,
  extractionDrafts,
  extractionDraftNodes,
  assets,
  storageObjects,
  storageDeletionJobs,
  bookmarks,
  tags,
  topicTags,
  recentViews,
} from "./app";

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [user.id],
    references: [profiles.id],
  }),
  preferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
  sessions: many(session),
  accounts: many(account),
  folders: many(folders),
  documents: many(documents),
  topics: many(topics),
  bookmarks: many(bookmarks),
  tags: many(tags),
  recentViews: many(recentViews),
}));

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.id],
    references: [user.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(user, {
    fields: [folders.userId],
    references: [user.id],
  }),
  parentFolder: one(folders, {
    fields: [folders.parentFolderId],
    references: [folders.id],
    relationName: "folder_nesting",
  }),
  subFolders: many(folders, {
    relationName: "folder_nesting",
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
  folder: one(folders, {
    fields: [documents.folderId],
    references: [folders.id],
  }),
  topics: many(topics),
  processingJobs: many(processingJobs),
  pages: many(documentPages),
  extractionDrafts: many(extractionDrafts),
  assets: many(assets),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  user: one(user, {
    fields: [topics.userId],
    references: [user.id],
  }),
  document: one(documents, {
    fields: [topics.documentId],
    references: [documents.id],
  }),
  parentTopic: one(topics, {
    fields: [topics.parentTopicId],
    references: [topics.id],
    relationName: "topic_nesting",
  }),
  subTopics: many(topics, {
    relationName: "topic_nesting",
  }),
  versions: many(topicVersions),
  bookmarks: many(bookmarks),
  tags: many(topicTags),
  recentViews: many(recentViews),
  assets: many(assets),
}));

export const topicVersionsRelations = relations(topicVersions, ({ one }) => ({
  topic: one(topics, {
    fields: [topicVersions.topicId],
    references: [topics.id],
  }),
  author: one(user, {
    fields: [topicVersions.createdBy],
    references: [user.id],
  }),
}));

export const processingJobsRelations = relations(processingJobs, ({ one, many }) => ({
  user: one(user, {
    fields: [processingJobs.userId],
    references: [user.id],
  }),
  document: one(documents, {
    fields: [processingJobs.documentId],
    references: [documents.id],
  }),
  extractionDrafts: many(extractionDrafts),
}));

export const documentPagesRelations = relations(documentPages, ({ one }) => ({
  document: one(documents, {
    fields: [documentPages.documentId],
    references: [documents.id],
  }),
}));

export const extractionDraftsRelations = relations(extractionDrafts, ({ one, many }) => ({
  user: one(user, {
    fields: [extractionDrafts.userId],
    references: [user.id],
  }),
  document: one(documents, {
    fields: [extractionDrafts.documentId],
    references: [documents.id],
  }),
  processingJob: one(processingJobs, {
    fields: [extractionDrafts.processingJobId],
    references: [processingJobs.id],
  }),
  nodes: many(extractionDraftNodes),
}));

export const extractionDraftNodesRelations = relations(extractionDraftNodes, ({ one, many }) => ({
  draft: one(extractionDrafts, {
    fields: [extractionDraftNodes.draftId],
    references: [extractionDrafts.id],
  }),
  parentNode: one(extractionDraftNodes, {
    fields: [extractionDraftNodes.parentNodeId],
    references: [extractionDraftNodes.id],
    relationName: "node_nesting",
  }),
  childNodes: many(extractionDraftNodes, {
    relationName: "node_nesting",
  }),
}));

export const storageObjectsRelations = relations(storageObjects, ({ one, many }) => ({
  user: one(user, {
    fields: [storageObjects.userId],
    references: [user.id],
  }),
  assets: many(assets),
  deletionJobs: many(storageDeletionJobs),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  user: one(user, {
    fields: [assets.userId],
    references: [user.id],
  }),
  document: one(documents, {
    fields: [assets.documentId],
    references: [documents.id],
  }),
  topic: one(topics, {
    fields: [assets.topicId],
    references: [topics.id],
  }),
  storageObject: one(storageObjects, {
    fields: [assets.storageObjectId],
    references: [storageObjects.id],
  }),
}));

export const storageDeletionJobsRelations = relations(storageDeletionJobs, ({ one }) => ({
  user: one(user, {
    fields: [storageDeletionJobs.userId],
    references: [user.id],
  }),
  storageObject: one(storageObjects, {
    fields: [storageDeletionJobs.storageObjectId],
    references: [storageObjects.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
  topic: one(topics, {
    fields: [bookmarks.topicId],
    references: [topics.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(user, {
    fields: [tags.userId],
    references: [user.id],
  }),
  topics: many(topicTags),
}));

export const topicTagsRelations = relations(topicTags, ({ one }) => ({
  topic: one(topics, {
    fields: [topicTags.topicId],
    references: [topics.id],
  }),
  tag: one(tags, {
    fields: [topicTags.tagId],
    references: [tags.id],
  }),
}));

export const recentViewsRelations = relations(recentViews, ({ one }) => ({
  user: one(user, {
    fields: [recentViews.userId],
    references: [user.id],
  }),
  topic: one(topics, {
    fields: [recentViews.topicId],
    references: [topics.id],
  }),
}));
