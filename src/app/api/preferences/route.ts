import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { preferencesService } from "@/services/preferences.service";
import { updatePreferencesSchema } from "@/lib/validation/preferences";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET() {
  try {
    const session = await requireAuth();
    const prefs = await preferencesService.getPreferences(session.user.id);
    return apiSuccess(prefs);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = updatePreferencesSchema.parse(body);
    const updated = await preferencesService.updatePreferences(session.user.id, validated);
    return apiSuccess(updated, "Preferences updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
