import { z } from "zod";

export const createBookmarkSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
