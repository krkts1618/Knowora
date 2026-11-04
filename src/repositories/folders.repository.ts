import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { and, eq, isNull, asc, count } from "drizzle-orm";

export class FoldersRepository {
  async findById(id: string, userId: string) {
    const res = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async listByUser(userId: string, parentFolderId?: string | null) {
    const conditions = [eq(folders.userId, userId)];

    if (parentFolderId !== undefined) {
      if (parentFolderId === null) {
        conditions.push(isNull(folders.parentFolderId));
      } else {
        conditions.push(eq(folders.parentFolderId, parentFolderId));
      }
    }

    return await db
      .select()
      .from(folders)
      .where(and(...conditions))
      .orderBy(asc(folders.position), asc(folders.name));
  }

  async countByUser(userId: string) {
    const res = await db
      .select({ value: count() })
      .from(folders)
      .where(eq(folders.userId, userId));

    return Number(res[0]?.value || 0);
  }

  async create(data: {
    userId: string;
    name: string;
    parentFolderId?: string | null;
    position?: number;
  }) {
    const inserted = await db
      .insert(folders)
      .values({
        userId: data.userId,
        name: data.name,
        parentFolderId: data.parentFolderId || null,
        position: data.position ?? 0,
      })
      .returning();

    return inserted[0];
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      parentFolderId?: string | null;
      position?: number;
    }
  ) {
    const updated = await db
      .update(folders)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.parentFolderId !== undefined
          ? { parentFolderId: data.parentFolderId }
          : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .returning();

    return updated[0] || null;
  }

  async delete(id: string, userId: string) {
    const deleted = await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .returning();

    return deleted[0] || null;
  }
}

export const foldersRepository = new FoldersRepository();
