import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { searchService } from "@/services/search.service";
import { searchSchema } from "@/lib/validation/search";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const folderId = searchParams.get("folderId") || undefined;
    const documentId = searchParams.get("documentId") || undefined;
    const rawType = searchParams.get("type");
    const type = rawType && ["all", "topics", "documents", "folders"].includes(rawType)
      ? (rawType as "all" | "topics" | "documents" | "folders")
      : "all";
    const limit = searchParams.get("limit") || undefined;

    const validated = searchSchema.parse({
      q,
      folderId,
      documentId,
      type,
      limit,
    });

    const results = await searchService.search(session.user.id, validated);
    return apiSuccess(results);
  } catch (err) {
    return handleApiError(err);
  }
}
