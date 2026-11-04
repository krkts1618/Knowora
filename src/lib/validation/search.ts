import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  folderId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
  type: z.enum(["all", "topics", "documents", "folders"]).optional().default("all"),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export type SearchInput = z.input<typeof searchSchema>;
