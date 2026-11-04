import { z } from "zod";

export const recordRecentViewSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
});

export type RecordRecentViewInput = z.infer<typeof recordRecentViewSchema>;
