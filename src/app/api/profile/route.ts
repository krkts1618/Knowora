import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { profileService } from "@/services/profile.service";
import { updateProfileSchema } from "@/lib/validation/profile";
import { apiSuccess, handleApiError } from "@/lib/errors/api-response";



export async function GET() {
  try {
    const session = await requireAuth();
    const profile = await profileService.getProfile(session.user.id);
    return apiSuccess(profile);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);
    const updated = await profileService.updateProfile(session.user.id, validated);
    return apiSuccess(updated, "Profile updated successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
