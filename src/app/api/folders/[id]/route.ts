import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { foldersService } from "@/services/folders.service";
import { updateFolderSchema } from "@/lib/validation/folders";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);

    const folder = await foldersService.getFolderById(id, session.user.id);

    if (searchParams.get("path") === "true") {
      const path = await foldersService.getFolderPath(id, session.user.id);
      return apiSuccess({ ...folder, path });
    }

    return apiSuccess(folder);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();
    const validated = updateFolderSchema.parse(body);
    const updated = await foldersService.updateFolder(id, session.user.id, validated);
    return apiSuccess(updated, "Folder updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const deleted = await foldersService.deleteFolder(id, session.user.id);
    return apiSuccess(deleted, "Folder deleted successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
