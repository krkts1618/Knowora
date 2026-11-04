import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { tagsService } from "@/services/tags.service";
import { createTagSchema } from "@/lib/validation/tags";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET() {
  try {
    const session = await requireAuth();
    const tags = await tagsService.getTags(session.user.id);
    return apiSuccess(tags);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = createTagSchema.parse(body);
    const created = await tagsService.createTag(session.user.id, validated);
    return apiSuccess(created, "Tag created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
