import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Document title is required")
    .max(255, "Document title must be under 255 characters"),
  description: z.string().trim().max(1000).optional(),
  folderId: z.string().uuid("Invalid folder ID").nullable().optional(),
  sourceType: z.enum(["manual", "pdf"]).optional().default("manual"),
  originalFileKey: z.string().optional(),
  originalFileName: z.string().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional().default(0),
  mimeType: z.string().optional(),
  pageCount: z.number().int().nonnegative().optional().default(0),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Document title cannot be empty")
    .max(255, "Document title must be under 255 characters")
    .optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  folderId: z.string().uuid("Invalid folder ID").nullable().optional(),
});

export const deleteDocumentSchema = z.object({
  strategy: z.enum(["all", "pdf_only"]).default("all"),
});

export type CreateDocumentInput = z.input<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.input<typeof updateDocumentSchema>;
export type DeleteDocumentInput = z.input<typeof deleteDocumentSchema>;
