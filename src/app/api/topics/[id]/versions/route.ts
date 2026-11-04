import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { topicsService } from "@/services/topics.service";
import { createTopicVersionSchema } from "@/lib/validation/topics";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const versions = await topicsService.getTopicVersions(id, session.user.id);
    return apiSuccess(versions);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();
    const validated = createTopicVersionSchema.parse(body);
    const version = await topicsService.createTopicVersion(
      id,
      session.user.id,
      validated
    );
    return apiSuccess(version, "Topic version created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
