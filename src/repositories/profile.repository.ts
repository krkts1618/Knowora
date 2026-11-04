import { db } from "@/lib/db";
import { profiles, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class ProfileRepository {
  async findByUserId(userId: string) {
    const res = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        email: user.email,
        userName: user.name,
      })
      .from(profiles)
      .innerJoin(user, eq(profiles.id, user.id))
      .where(eq(profiles.id, userId))
      .limit(1);

    return res[0] || null;
  }

  async upsert(userId: string, data: { fullName?: string; avatarUrl?: string | null }) {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      const inserted = await db
        .insert(profiles)
        .values({
          id: userId,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
        })
        .returning();
      return inserted[0];
    }

    const updated = await db
      .update(profiles)
      .set({
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    return updated[0];
  }
}

export const profileRepository = new ProfileRepository();
