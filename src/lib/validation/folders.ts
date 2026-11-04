import { z } from "zod";

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(255, "Folder name must be under 255 characters"),
  parentFolderId: z.string().uuid("Invalid parent folder ID").nullable().optional(),
  position: z.number().int().nonnegative().optional().default(0),
});

export const updateFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name cannot be empty")
    .max(255, "Folder name must be under 255 characters")
    .optional(),
  parentFolderId: z.string().uuid("Invalid parent folder ID").nullable().optional(),
  position: z.number().int().nonnegative().optional(),
});

export type CreateFolderInput = z.input<typeof createFolderSchema>;
export type UpdateFolderInput = z.input<typeof updateFolderSchema>;
