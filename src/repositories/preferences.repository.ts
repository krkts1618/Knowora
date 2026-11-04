import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class PreferencesRepository {
  async findByUserId(userId: string) {
    const res = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return res[0] || null;
  }

  async upsert(
    userId: string,
    data: {
      theme?: "light" | "dark" | "system";
      editorPreferences?: Record<string, unknown>;
      keyboardShortcuts?: Record<string, unknown>;
    }
  ) {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      const inserted = await db
        .insert(userPreferences)
        .values({
          userId,
          theme: data.theme || "system",
          editorPreferences: data.editorPreferences || {},
          keyboardShortcuts: data.keyboardShortcuts || {},
        })
        .returning();
      return inserted[0];
    }

    const updated = await db
      .update(userPreferences)
      .set({
        ...(data.theme !== undefined ? { theme: data.theme } : {}),
        ...(data.editorPreferences !== undefined
          ? { editorPreferences: data.editorPreferences }
          : {}),
        ...(data.keyboardShortcuts !== undefined
          ? { keyboardShortcuts: data.keyboardShortcuts }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return updated[0];
  }
}

export const preferencesRepository = new PreferencesRepository();
