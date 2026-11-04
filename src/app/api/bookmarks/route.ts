import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { bookmarksService } from "@/services/bookmarks.service";
import { createBookmarkSchema } from "@/lib/validation/bookmarks";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET() {
  try {
    const session = await requireAuth();
    const bookmarks = await bookmarksService.getBookmarks(session.user.id);
    return apiSuccess(bookmarks);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = createBookmarkSchema.parse(body);
    const created = await bookmarksService.createBookmark(session.user.id, validated);
    return apiSuccess(created, "Bookmark added successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
