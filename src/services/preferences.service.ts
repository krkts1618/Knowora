import { preferencesRepository } from "@/repositories/preferences.repository";
import { UpdatePreferencesInput } from "@/lib/validation/preferences";

export class PreferencesService {
  async getPreferences(userId: string) {
    const prefs = await preferencesRepository.findByUserId(userId);
    if (!prefs) {
      return await preferencesRepository.upsert(userId, {
        theme: "system",
        editorPreferences: {},
        keyboardShortcuts: {},
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: UpdatePreferencesInput) {
    return await preferencesRepository.upsert(userId, data);
  }
}

export const preferencesService = new PreferencesService();
