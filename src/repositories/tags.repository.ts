import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";

export class TagsRepository {
  async listByUser(userId: string) {
    return await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(asc(tags.name));
  }

  async findById(id: string, userId: string) {
    const res = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async findByName(name: string, userId: string) {
    const res = await db
      .select()
      .from(tags)
      .where(and(eq(tags.name, name), eq(tags.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async create(data: { userId: string; name: string; color?: string }) {
    const inserted = await db
      .insert(tags)
      .values({
        userId: data.userId,
        name: data.name,
        color: data.color || "#1F6B4D",
      })
      .returning();

    return inserted[0];
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; color?: string }
  ) {
    const updated = await db
      .update(tags)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
      })
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .returning();

    return updated[0] || null;
  }

  async delete(id: string, userId: string) {
    const deleted = await db
      .delete(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .returning();

    return deleted[0] || null;
  }
}

export const tagsRepository = new TagsRepository();
