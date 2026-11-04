import { z } from "zod";

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  editorPreferences: z.record(z.string(), z.any()).optional(),
  keyboardShortcuts: z.record(z.string(), z.any()).optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
