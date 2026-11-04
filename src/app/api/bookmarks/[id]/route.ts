import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { bookmarksService } from "@/services/bookmarks.service";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const deleted = await bookmarksService.deleteBookmark(id, session.user.id);
    return apiSuccess(deleted, "Bookmark removed successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
