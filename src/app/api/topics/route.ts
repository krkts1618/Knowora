import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { topicsService } from "@/services/topics.service";
import { createTopicSchema } from "@/lib/validation/topics";
import { parsePaginationParams } from "@/lib/utils/pagination";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId") || undefined;
    const parentTopicIdParam = searchParams.get("parentTopicId");

    // If specific document and parentTopicId (or tree mode) requested
    if (documentId && parentTopicIdParam !== null) {
      const parentTopicId =
        parentTopicIdParam === "null" || parentTopicIdParam === ""
          ? null
          : parentTopicIdParam;

      const topics = await topicsService.getTopicsByDocument(
        documentId,
        session.user.id,
        parentTopicId
      );
      return apiSuccess(topics);
    }

    const pagination = parsePaginationParams(searchParams);
    const result = await topicsService.getTopics(session.user.id, {
      documentId,
      page: pagination.page,
      pageSize: pagination.pageSize,
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
    const validated = createTopicSchema.parse(body);
    const created = await topicsService.createTopic(session.user.id, validated);
    return apiSuccess(created, "Topic created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
