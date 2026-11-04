import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { documentsService } from "@/services/documents.service";
import {
  updateDocumentSchema,
  deleteDocumentSchema,
} from "@/lib/validation/documents";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const document = await documentsService.getDocumentById(id, session.user.id);
    return apiSuccess(document);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();
    const validated = updateDocumentSchema.parse(body);
    const updated = await documentsService.updateDocument(id, session.user.id, validated);
    return apiSuccess(updated, "Document updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    let strategy: "all" | "pdf_only" = "all";
    try {
      const body = await req.json();
      const parsed = deleteDocumentSchema.safeParse(body);
      if (parsed.success) {
        strategy = parsed.data.strategy;
      }
    } catch {
      const { searchParams } = new URL(req.url);
      const queryStrategy = searchParams.get("strategy");
      if (queryStrategy === "pdf_only") {
        strategy = "pdf_only";
      }
    }

    const result = await documentsService.deleteDocument(id, session.user.id, {
      strategy,
    });
    return apiSuccess(
      result,
      strategy === "pdf_only"
        ? "Original PDF deleted, document notes retained"
        : "Document completely deleted"
    );
  } catch (err) {
    return handleApiError(err);
  }
}
