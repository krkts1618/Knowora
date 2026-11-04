import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { topicsService } from "@/services/topics.service";
import { updateTopicSchema } from "@/lib/validation/topics";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const topic = await topicsService.getTopicById(id, session.user.id);
    return apiSuccess(topic);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();
    const validated = updateTopicSchema.parse(body);
    const updated = await topicsService.updateTopic(id, session.user.id, validated);
    return apiSuccess(updated, "Topic updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const deleted = await topicsService.deleteTopic(id, session.user.id);
    return apiSuccess(deleted, "Topic deleted successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
