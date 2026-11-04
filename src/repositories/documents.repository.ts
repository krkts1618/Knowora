import { db } from "@/lib/db";
import { documents, storageObjects, storageDeletionJobs } from "@/lib/db/schema";
import { and, eq, isNull, desc, count } from "drizzle-orm";

export class DocumentsRepository {
  async findById(id: string, userId: string) {
    const res = await db
      .select()
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

    return await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt))
      .limit(options.limit)
      .offset(options.offset);
  }

  async countByUser(userId: string, folderId?: string | null) {
    const conditions = [eq(documents.userId, userId)];

    if (folderId !== undefined) {
      if (folderId === null) {
        conditions.push(isNull(documents.folderId));
      } else {
        conditions.push(eq(documents.folderId, folderId));
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
        processingStatus: data.sourceType === "pdf" ? "completed" : "completed",
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
      pageCount?: number;
      processingStatus?: string;
    }
  ) {
    const updated = await db
      .update(documents)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.folderId !== undefined ? { folderId: data.folderId } : {}),
        ...(data.pageCount !== undefined ? { pageCount: data.pageCount } : {}),
        ...(data.processingStatus !== undefined
          ? { processingStatus: data.processingStatus }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return updated[0] || null;
  }

  async deleteComplete(id: string, userId: string) {
    const deleted = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return deleted[0] || null;
  }

  async deletePdfOnly(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const doc = await tx
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), eq(documents.userId, userId)))
        .limit(1);

      if (!doc[0]) return null;

      const fileKey = doc[0].originalFileKey;

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

      // If there was an associated storage object, schedule deletion
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

      return updated[0];
    });
  }
}

export const documentsRepository = new DocumentsRepository();
