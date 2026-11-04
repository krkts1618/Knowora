import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { foldersService } from "@/services/folders.service";
import { createFolderSchema } from "@/lib/validation/folders";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);

    if (searchParams.get("all") === "true") {
      const allFolders = await foldersService.getAllFolders(session.user.id);
      return apiSuccess(allFolders);
    }

    const parentFolderId = searchParams.get("parentFolderId");
    const parent =
      parentFolderId === "null" || parentFolderId === ""
        ? null
        : parentFolderId || undefined;

    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as
      | "name-asc"
      | "name-desc"
      | "updated-desc"
      | "created-desc") || undefined;

    const folderList = await foldersService.getFolders(session.user.id, parent, {
      search,
      sortBy,
    });
    return apiSuccess(folderList);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = createFolderSchema.parse(body);
    const created = await foldersService.createFolder(session.user.id, validated);
    return apiSuccess(created, "Folder created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
