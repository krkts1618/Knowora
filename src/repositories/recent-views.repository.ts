import { db } from "@/lib/db";
import { recentViews, topics, documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export class RecentViewsRepository {
  async listByUser(userId: string, limit = 20) {
    return await db
      .select({
        id: recentViews.id,
        userId: recentViews.userId,
        topicId: recentViews.topicId,
        viewedAt: recentViews.viewedAt,
        topicTitle: topics.title,
        documentId: topics.documentId,
        documentTitle: documents.title,
      })
      .from(recentViews)
      .innerJoin(topics, eq(recentViews.topicId, topics.id))
      .innerJoin(documents, eq(topics.documentId, documents.id))
      .where(eq(recentViews.userId, userId))
      .orderBy(desc(recentViews.viewedAt))
      .limit(limit);
  }

  async recordView(userId: string, topicId: string) {
    const upserted = await db
      .insert(recentViews)
      .values({
        userId,
        topicId,
        viewedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [recentViews.userId, recentViews.topicId],
        set: { viewedAt: new Date() },
      })
      .returning();

    return upserted[0];
  }
}

export const recentViewsRepository = new RecentViewsRepository();
