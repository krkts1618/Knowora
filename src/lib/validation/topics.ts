import { z } from "zod";

export const createTopicSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  parentTopicId: z.string().uuid("Invalid parent topic ID").nullable().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Topic title is required")
    .max(255, "Topic title must be under 255 characters"),
  content: z.record(z.string(), z.any()).optional().default({}),
  plainText: z.string().optional().default(""),
  position: z.number().int().nonnegative().optional().default(0),
  sourcePageStart: z.number().int().positive().nullable().optional(),
  sourcePageEnd: z.number().int().positive().nullable().optional(),
  origin: z.enum(["manual", "extracted"]).optional().default("manual"),
});

export const updateTopicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Topic title cannot be empty")
    .max(255, "Topic title must be under 255 characters")
    .optional(),
  content: z.record(z.string(), z.any()).optional(),
  plainText: z.string().optional(),
  position: z.number().int().nonnegative().optional(),
  parentTopicId: z.string().uuid("Invalid parent topic ID").nullable().optional(),
  createSnapshot: z.boolean().optional().default(true),
});

export const createTopicVersionSchema = z.object({
  titleSnapshot: z.string().trim().min(1, "Title snapshot is required").optional(),
  contentSnapshot: z.record(z.string(), z.any()).optional(),
  plainTextSnapshot: z.string().optional(),
});

export type CreateTopicInput = z.input<typeof createTopicSchema>;
export type UpdateTopicInput = z.input<typeof updateTopicSchema>;
export type CreateTopicVersionInput = z.input<typeof createTopicVersionSchema>;
