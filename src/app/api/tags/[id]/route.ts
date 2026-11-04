import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { tagsService } from "@/services/tags.service";
import { updateTagSchema } from "@/lib/validation/tags";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();
    const validated = updateTagSchema.parse(body);
    const updated = await tagsService.updateTag(id, session.user.id, validated);
    return apiSuccess(updated, "Tag updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const deleted = await tagsService.deleteTag(id, session.user.id);
    return apiSuccess(deleted, "Tag deleted successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
