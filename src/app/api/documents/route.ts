import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { documentsService } from "@/services/documents.service";
import { createDocumentSchema } from "@/lib/validation/documents";
import { parsePaginationParams } from "@/lib/utils/pagination";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const pagination = parsePaginationParams(searchParams);
    const folderIdParam = searchParams.get("folderId");
    const folderId =
      folderIdParam === "null" || folderIdParam === ""
        ? null
        : folderIdParam || undefined;

    const search = searchParams.get("search") || undefined;
    const sourceType = (searchParams.get("sourceType") as "manual" | "pdf") || undefined;
    const sortBy = (searchParams.get("sortBy") as
      | "name-asc"
      | "name-desc"
      | "updated-desc"
      | "created-desc") || undefined;

    const result = await documentsService.getDocuments(session.user.id, {
      folderId,
      page: pagination.page,
      pageSize: pagination.pageSize,
      search,
      sourceType,
      sortBy,
    });

    return apiSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = createDocumentSchema.parse(body);
    const created = await documentsService.createDocument(session.user.id, validated);
    return apiSuccess(created, "Document created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
