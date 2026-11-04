import { db } from "@/lib/db";
import { bookmarks, topics, documents } from "@/lib/db/schema";
import { and, eq, desc, count } from "drizzle-orm";

export class BookmarksRepository {
  async listByUser(userId: string) {
    return await db
      .select({
        id: bookmarks.id,
        userId: bookmarks.userId,
        topicId: bookmarks.topicId,
        createdAt: bookmarks.createdAt,
        topicTitle: topics.title,
        documentId: topics.documentId,
        documentTitle: documents.title,
      })
      .from(bookmarks)
      .innerJoin(topics, eq(bookmarks.topicId, topics.id))
      .innerJoin(documents, eq(topics.documentId, documents.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async countByUser(userId: string) {
    const res = await db
      .select({ value: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return Number(res[0]?.value || 0);
  }

  async findById(id: string, userId: string) {
    const res = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async findByUserAndTopic(userId: string, topicId: string) {
    const res = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.topicId, topicId)))
      .limit(1);

    return res[0] || null;
  }

  async create(userId: string, topicId: string) {
    const inserted = await db
      .insert(bookmarks)
      .values({
        userId,
        topicId,
      })
      .onConflictDoNothing({ target: [bookmarks.userId, bookmarks.topicId] })
      .returning();

    if (inserted[0]) return inserted[0];
    return await this.findByUserAndTopic(userId, topicId);
  }

  async delete(id: string, userId: string) {
    const deleted = await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
      .returning();

    return deleted[0] || null;
  }
}

export const bookmarksRepository = new BookmarksRepository();
