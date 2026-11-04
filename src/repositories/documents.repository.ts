import { db } from "@/lib/db";
import { documents, storageObjects, storageDeletionJobs } from "@/lib/db/schema";
import {
  and,
  eq,
  isNull,
  desc,
  asc,
  count,
  sql,
  getTableColumns,
  ilike,
  or,
} from "drizzle-orm";

export class DocumentsRepository {
  async findById(id: string, userId: string) {
    const res = await db
      .select({
        ...getTableColumns(documents),
        topicCount: sql<number>`(SELECT count(*)::int FROM topics WHERE topics.document_id = documents.id)`,
      })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async listByUser(
    userId: string,
    options: {
      folderId?: string | null;
      limit: number;
      offset: number;
      search?: string;
      sourceType?: "manual" | "pdf";
      sortBy?: "name-asc" | "name-desc" | "updated-desc" | "created-desc";
    }
  ) {
    const conditions = [eq(documents.userId, userId)];

    if (options.folderId !== undefined) {
      if (options.folderId === null) {
        conditions.push(isNull(documents.folderId));
      } else {
        conditions.push(eq(documents.folderId, options.folderId));
      }
    }

    if (options.sourceType) {
      conditions.push(eq(documents.sourceType, options.sourceType));
    }

    if (options.search && options.search.trim()) {
      const pattern = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(documents.title, pattern),
          ilike(documents.description, pattern)
        )!
      );
    }

    let orderByClause = desc(documents.createdAt);
    if (options.sortBy === "name-asc") {
      orderByClause = asc(documents.title);
    } else if (options.sortBy === "name-desc") {
      orderByClause = desc(documents.title);
    } else if (options.sortBy === "updated-desc") {
      orderByClause = desc(documents.updatedAt);
    }

    return await db
      .select({
        ...getTableColumns(documents),
        topicCount: sql<number>`(SELECT count(*)::int FROM topics WHERE topics.document_id = documents.id)`,
      })
      .from(documents)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(options.limit)
      .offset(options.offset);
  }

  async countByUser(
    userId: string,
    options?:
      | {
          folderId?: string | null;
          search?: string;
          sourceType?: "manual" | "pdf";
        }
      | string
      | null
  ) {
    const conditions = [eq(documents.userId, userId)];

    if (typeof options === "string" || options === null) {
      if (options === null) {
        conditions.push(isNull(documents.folderId));
      } else if (options) {
        conditions.push(eq(documents.folderId, options));
      }
    } else if (options) {
      if (options.folderId !== undefined) {
        if (options.folderId === null) {
          conditions.push(isNull(documents.folderId));
        } else {
          conditions.push(eq(documents.folderId, options.folderId));
        }
      }
      if (options.sourceType) {
        conditions.push(eq(documents.sourceType, options.sourceType));
      }
      if (options.search && options.search.trim()) {
        const pattern = `%${options.search.trim()}%`;
        conditions.push(
          or(
            ilike(documents.title, pattern),
            ilike(documents.description, pattern)
          )!
        );
      }
    }

    const res = await db
      .select({ value: count() })
      .from(documents)
      .where(and(...conditions));

    return Number(res[0]?.value || 0);
  }

  async create(data: {
    userId: string;
    title: string;
    description?: string;
    folderId?: string | null;
    sourceType?: "manual" | "pdf";
    originalFileKey?: string;
    originalFileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    pageCount?: number;
  }) {
    const inserted = await db
      .insert(documents)
      .values({
        userId: data.userId,
        title: data.title,
        description: data.description,
        folderId: data.folderId || null,
        sourceType: data.sourceType || "manual",
        originalFileKey: data.originalFileKey,
        originalFileName: data.originalFileName,
        fileSizeBytes: data.fileSizeBytes ?? 0,
        mimeType: data.mimeType,
        pageCount: data.pageCount ?? 0,
        processingStatus: "completed",
      })
      .returning();

    return inserted[0];
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      folderId?: string | null;
    }
  ) {
    const updated = await db
      .update(documents)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.folderId !== undefined ? { folderId: data.folderId } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return updated[0] || null;
  }

  // Deletion Option 1: Complete Deletion (Cascades through topics, bookmarks, recent-views, and marks storage objects)
  async deleteComplete(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      // 1. Fetch document to check if original file key exists
      const docRes = await tx
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), eq(documents.userId, userId)))
        .limit(1);

      const doc = docRes[0];
      if (!doc) return null;

      const fileKey = doc.originalFileKey;

      // 2. If PDF original key exists, register a deletion job for Cloudflare R2
      if (fileKey) {
        const storages = await tx
          .select()
          .from(storageObjects)
          .where(and(eq(storageObjects.userId, userId), eq(storageObjects.objectKey, fileKey)))
          .limit(1);

        if (storages[0]) {
          await tx.insert(storageDeletionJobs).values({
            userId,
            storageObjectId: storages[0].id,
            status: "pending",
          });
        }
      }

      // 3. Delete document (foreign key cascades will clean up topics, topicVersions, bookmarks, recentViews)
      const deleted = await tx
        .delete(documents)
        .where(and(eq(documents.id, id), eq(documents.userId, userId)))
        .returning();

      return deleted[0] || null;
    });
  }

  // Deletion Option 2: PDF-Only Deletion (Retains document entity & extracted topics, resets storage metadata)
  async deletePdfOnly(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const docRes = await tx
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), eq(documents.userId, userId)))
        .limit(1);

      const doc = docRes[0];
      if (!doc) return null;

      const fileKey = doc.originalFileKey;

      if (fileKey) {
        const storages = await tx
          .select()
          .from(storageObjects)
          .where(and(eq(storageObjects.userId, userId), eq(storageObjects.objectKey, fileKey)))
          .limit(1);

        if (storages[0]) {
          await tx.insert(storageDeletionJobs).values({
            userId,
            storageObjectId: storages[0].id,
            status: "pending",
          });
        }
      }

      const updated = await tx
        .update(documents)
        .set({
          originalFileKey: null,
          originalFileName: null,
          fileSizeBytes: 0,
          mimeType: null,
          updatedAt: new Date(),
        })
        .where(and(eq(documents.id, id), eq(documents.userId, userId)))
        .returning();

      return updated[0] || null;
    });
  }
}

export const documentsRepository = new DocumentsRepository();
