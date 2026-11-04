import { db } from "@/lib/db";
import { folders, documents, topics, tags } from "@/lib/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { SearchInput, searchSchema } from "@/lib/validation/search";

export class SearchService {
  async search(userId: string, rawParams: SearchInput) {
    const params = searchSchema.parse(rawParams);
    const q = params.q.trim();
    const pattern = `%${q}%`;
    const limit = params.limit ?? 20;

    const results: {
      folders: Array<{
        id: string;
        name: string;
        parentFolderId: string | null;
        createdAt: Date;
      }>;
      documents: Array<{
        id: string;
        title: string;
        description: string | null;
        folderId: string | null;
        sourceType: string;
        createdAt: Date;
      }>;
      topics: Array<{
        id: string;
        title: string;
        plainText: string;
        documentId: string;
        parentTopicId: string | null;
        createdAt: Date;
      }>;
      tags: Array<{
        id: string;
        name: string;
        color: string;
        createdAt: Date;
      }>;
    } = {
      folders: [],
      documents: [],
      topics: [],
      tags: [],
    };

    if (params.type === "all" || params.type === "folders") {
      results.folders = await db
        .select({
          id: folders.id,
          name: folders.name,
          parentFolderId: folders.parentFolderId,
          createdAt: folders.createdAt,
        })
        .from(folders)
        .where(and(eq(folders.userId, userId), ilike(folders.name, pattern)))
        .limit(limit);
    }

    if (params.type === "all" || params.type === "documents") {
      results.documents = await db
        .select({
          id: documents.id,
          title: documents.title,
          description: documents.description,
          folderId: documents.folderId,
          sourceType: documents.sourceType,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(
          and(
            eq(documents.userId, userId),
            or(ilike(documents.title, pattern), ilike(documents.description, pattern))
          )
        )
        .limit(limit);
    }

    if (params.type === "all" || params.type === "topics") {
      results.topics = await db
        .select({
          id: topics.id,
          title: topics.title,
          plainText: topics.plainText,
          documentId: topics.documentId,
          parentTopicId: topics.parentTopicId,
          createdAt: topics.createdAt,
        })
        .from(topics)
        .where(
          and(
            eq(topics.userId, userId),
            or(ilike(topics.title, pattern), ilike(topics.plainText, pattern))
          )
        )
        .limit(limit);
    }

    if (params.type === "all") {
      results.tags = await db
        .select({
          id: tags.id,
          name: tags.name,
          color: tags.color,
          createdAt: tags.createdAt,
        })
        .from(tags)
        .where(and(eq(tags.userId, userId), ilike(tags.name, pattern)))
        .limit(limit);
    }

    return results;
  }
}

export const searchService = new SearchService();
