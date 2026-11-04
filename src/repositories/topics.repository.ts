import { db } from "@/lib/db";
import { topics, topicVersions } from "@/lib/db/schema";
import { and, eq, isNull, asc, desc, max, count } from "drizzle-orm";

export class TopicsRepository {
  async findById(id: string, userId: string) {
    const res = await db
      .select()
      .from(topics)
      .where(and(eq(topics.id, id), eq(topics.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async listByDocument(
    documentId: string,
    userId: string,
    parentTopicId?: string | null
  ) {
    const conditions = [
      eq(topics.documentId, documentId),
      eq(topics.userId, userId),
    ];

    if (parentTopicId !== undefined) {
      if (parentTopicId === null) {
        conditions.push(isNull(topics.parentTopicId));
      } else {
        conditions.push(eq(topics.parentTopicId, parentTopicId));
      }
    }

    return await db
      .select()
      .from(topics)
      .where(and(...conditions))
      .orderBy(asc(topics.position), asc(topics.createdAt));
  }

  async listByUser(
    userId: string,
    options: {
      documentId?: string;
      limit: number;
      offset: number;
    }
  ) {
    const conditions = [eq(topics.userId, userId)];
    if (options.documentId) {
      conditions.push(eq(topics.documentId, options.documentId));
    }

    return await db
      .select()
      .from(topics)
      .where(and(...conditions))
      .orderBy(asc(topics.position), asc(topics.createdAt))
      .limit(options.limit)
      .offset(options.offset);
  }

  async countByUser(userId: string, documentId?: string) {
    const conditions = [eq(topics.userId, userId)];
    if (documentId) {
      conditions.push(eq(topics.documentId, documentId));
    }

    const res = await db
      .select({ value: count() })
      .from(topics)
      .where(and(...conditions));

    return Number(res[0]?.value || 0);
  }

  async create(data: {
    userId: string;
    documentId: string;
    parentTopicId?: string | null;
    title: string;
    content?: Record<string, unknown>;
    plainText?: string;
    position?: number;
    sourcePageStart?: number | null;
    sourcePageEnd?: number | null;
    origin?: "manual" | "extracted";
  }) {
    return await db.transaction(async (tx) => {
      const insertedTopic = await tx
        .insert(topics)
        .values({
          userId: data.userId,
          documentId: data.documentId,
          parentTopicId: data.parentTopicId || null,
          title: data.title,
          content: data.content || {},
          plainText: data.plainText || "",
          position: data.position ?? 0,
          sourcePageStart: data.sourcePageStart,
          sourcePageEnd: data.sourcePageEnd,
          origin: data.origin || "manual",
        })
        .returning();

      const created = insertedTopic[0];

      // Create initial version snapshot (version 1)
      await tx.insert(topicVersions).values({
        topicId: created.id,
        userId: data.userId,
        versionNumber: 1,
        titleSnapshot: created.title,
        contentSnapshot: created.content,
        plainTextSnapshot: created.plainText,
        createdBy: data.userId,
      });

      return created;
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      content?: Record<string, unknown>;
      plainText?: string;
      position?: number;
      parentTopicId?: string | null;
    },
    createSnapshot = true
  ) {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(topics)
        .where(and(eq(topics.id, id), eq(topics.userId, userId)))
        .limit(1);

      if (!current[0]) return null;

      const currentTopic = current[0];

      // If content or title changed and snapshot requested, create version snapshot
      const contentChanged =
        (data.title !== undefined && data.title !== currentTopic.title) ||
        (data.content !== undefined &&
          JSON.stringify(data.content) !== JSON.stringify(currentTopic.content)) ||
        (data.plainText !== undefined && data.plainText !== currentTopic.plainText);

      if (createSnapshot && contentChanged) {
        const maxVersionRes = await tx
          .select({ maxVal: max(topicVersions.versionNumber) })
          .from(topicVersions)
          .where(eq(topicVersions.topicId, id));

        const nextVersion = (maxVersionRes[0]?.maxVal ?? 0) + 1;

        await tx.insert(topicVersions).values({
          topicId: id,
          userId,
          versionNumber: nextVersion,
          titleSnapshot: data.title ?? currentTopic.title,
          contentSnapshot: data.content ?? currentTopic.content,
          plainTextSnapshot: data.plainText ?? currentTopic.plainText,
          createdBy: userId,
        });
      }

      const updated = await tx
        .update(topics)
        .set({
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.plainText !== undefined ? { plainText: data.plainText } : {}),
          ...(data.position !== undefined ? { position: data.position } : {}),
          ...(data.parentTopicId !== undefined
            ? { parentTopicId: data.parentTopicId }
            : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(topics.id, id), eq(topics.userId, userId)))
        .returning();

      return updated[0];
    });
  }

  async delete(id: string, userId: string) {
    const deleted = await db
      .delete(topics)
      .where(and(eq(topics.id, id), eq(topics.userId, userId)))
      .returning();

    return deleted[0] || null;
  }

  // Versions
  async getVersions(topicId: string, userId: string) {
    return await db
      .select()
      .from(topicVersions)
      .where(and(eq(topicVersions.topicId, topicId), eq(topicVersions.userId, userId)))
      .orderBy(desc(topicVersions.versionNumber));
  }

  async getVersionById(topicId: string, versionId: string, userId: string) {
    const res = await db
      .select()
      .from(topicVersions)
      .where(
        and(
          eq(topicVersions.id, versionId),
          eq(topicVersions.topicId, topicId),
          eq(topicVersions.userId, userId)
        )
      )
      .limit(1);

    return res[0] || null;
  }

  async restoreVersion(topicId: string, versionId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // 1. Get current topic
      const current = await tx
        .select()
        .from(topics)
        .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
        .limit(1);

      if (!current[0]) return null;

      // 2. Get target version snapshot
      const targetVersion = await tx
        .select()
        .from(topicVersions)
        .where(
          and(
            eq(topicVersions.id, versionId),
            eq(topicVersions.topicId, topicId),
            eq(topicVersions.userId, userId)
          )
        )
        .limit(1);

      if (!targetVersion[0]) return null;

      const target = targetVersion[0];

      // 3. Create a snapshot of current state before restoration
      const maxVersionRes = await tx
        .select({ maxVal: max(topicVersions.versionNumber) })
        .from(topicVersions)
        .where(eq(topicVersions.topicId, topicId));

      const nextVersion = (maxVersionRes[0]?.maxVal ?? 0) + 1;

      await tx.insert(topicVersions).values({
        topicId,
        userId,
        versionNumber: nextVersion,
        titleSnapshot: current[0].title,
        contentSnapshot: current[0].content,
        plainTextSnapshot: current[0].plainText,
        createdBy: userId,
      });

      // 4. Update topic with restored snapshot data
      const restored = await tx
        .update(topics)
        .set({
          title: target.titleSnapshot,
          content: target.contentSnapshot,
          plainText: target.plainTextSnapshot,
          updatedAt: new Date(),
        })
        .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
        .returning();

      return restored[0];
    });
  }

  async createVersion(
    topicId: string,
    userId: string,
    data: {
      titleSnapshot?: string;
      contentSnapshot?: Record<string, unknown>;
      plainTextSnapshot?: string;
    }
  ) {
    return await db.transaction(async (tx) => {
      const topic = await tx
        .select()
        .from(topics)
        .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
        .limit(1);

      if (!topic[0]) return null;

      const maxVersionRes = await tx
        .select({ maxVal: max(topicVersions.versionNumber) })
        .from(topicVersions)
        .where(eq(topicVersions.topicId, topicId));

      const nextVersion = (maxVersionRes[0]?.maxVal ?? 0) + 1;

      const inserted = await tx
        .insert(topicVersions)
        .values({
          topicId,
          userId,
          versionNumber: nextVersion,
          titleSnapshot: data.titleSnapshot || topic[0].title,
          contentSnapshot: data.contentSnapshot || topic[0].content,
          plainTextSnapshot: data.plainTextSnapshot || topic[0].plainText,
          createdBy: userId,
        })
        .returning();

      return inserted[0];
    });
  }
}

export const topicsRepository = new TopicsRepository();
