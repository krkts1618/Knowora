import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import {
  and,
  eq,
  isNull,
  asc,
  desc,
  count,
  sql,
  getTableColumns,
  ilike,
} from "drizzle-orm";

export class FoldersRepository {
  async findById(id: string, userId: string) {
    const res = await db
      .select({
        ...getTableColumns(folders),
        documentCount: sql<number>`(SELECT count(*)::int FROM documents WHERE documents.folder_id = folders.id)`,
        subfolderCount: sql<number>`(SELECT count(*)::int FROM folders AS sub WHERE sub.parent_folder_id = folders.id)`,
      })
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .limit(1);

    return res[0] || null;
  }

  async listByUser(
    userId: string,
    parentFolderId?: string | null,
    options?: {
      search?: string;
      sortBy?: "name-asc" | "name-desc" | "updated-desc" | "created-desc";
    }
  ) {
    const conditions = [eq(folders.userId, userId)];

    if (parentFolderId !== undefined) {
      if (parentFolderId === null) {
        conditions.push(isNull(folders.parentFolderId));
      } else {
        conditions.push(eq(folders.parentFolderId, parentFolderId));
      }
    }

    if (options?.search && options.search.trim()) {
      conditions.push(ilike(folders.name, `%${options.search.trim()}%`));
    }

    let orderByClause = asc(folders.name);
    if (options?.sortBy === "name-desc") {
      orderByClause = desc(folders.name);
    } else if (options?.sortBy === "updated-desc") {
      orderByClause = desc(folders.updatedAt);
    } else if (options?.sortBy === "created-desc") {
      orderByClause = desc(folders.createdAt);
    }

    return await db
      .select({
        ...getTableColumns(folders),
        documentCount: sql<number>`(SELECT count(*)::int FROM documents WHERE documents.folder_id = folders.id)`,
        subfolderCount: sql<number>`(SELECT count(*)::int FROM folders AS sub WHERE sub.parent_folder_id = folders.id)`,
      })
      .from(folders)
      .where(and(...conditions))
      .orderBy(orderByClause);
  }

  async listAllByUser(userId: string) {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(asc(folders.name));
  }

  async getFolderPath(
    folderId: string,
    userId: string
  ): Promise<Array<{ id: string; name: string; parentFolderId: string | null }>> {
    const res = await db.execute(sql`
      WITH RECURSIVE folder_path AS (
        SELECT id, name, parent_folder_id, 1 as depth
        FROM folders
        WHERE id = ${folderId} AND user_id = ${userId}
        
        UNION ALL
        
        SELECT f.id, f.name, f.parent_folder_id, fp.depth + 1
        FROM folders f
        JOIN folder_path fp ON f.id = fp.parent_folder_id
        WHERE f.user_id = ${userId}
      )
      SELECT id, name, parent_folder_id as "parentFolderId" FROM folder_path ORDER BY depth DESC;
    `);
    return res.rows as Array<{ id: string; name: string; parentFolderId: string | null }>;
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
