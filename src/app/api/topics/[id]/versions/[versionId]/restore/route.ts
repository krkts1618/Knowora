import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { topicsService } from "@/services/topics.service";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string; versionId: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id, versionId } = await context.params;
    const restored = await topicsService.restoreTopicVersion(
      id,
      versionId,
      session.user.id
    );
    return apiSuccess(restored, "Topic version restored successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
