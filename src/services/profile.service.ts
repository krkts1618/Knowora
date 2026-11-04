import { profileRepository } from "@/repositories/profile.repository";
import { UpdateProfileInput } from "@/lib/validation/profile";
import { NotFoundError } from "@/lib/errors/app-error";

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      // Auto-create initial profile if missing
      return await profileRepository.upsert(userId, {});
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const updated = await profileRepository.upsert(userId, data);
    if (!updated) {
      throw new NotFoundError("Profile could not be found or updated");
    }
    return updated;
  }
}

export const profileService = new ProfileService();
