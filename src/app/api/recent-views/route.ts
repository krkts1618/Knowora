import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { recentViewsService } from "@/services/recent-views.service";
import { recordRecentViewSchema } from "@/lib/validation/recent-views";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET() {
  try {
    const session = await requireAuth();
    const views = await recentViewsService.getRecentViews(session.user.id);
    return apiSuccess(views);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = recordRecentViewSchema.parse(body);
    const view = await recentViewsService.recordRecentView(session.user.id, validated);
    return apiSuccess(view, "Recent view recorded");
  } catch (err) {
    return handleApiError(err);
  }
}
