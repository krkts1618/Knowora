import { recentViewsRepository } from "@/repositories/recent-views.repository";
import { topicsRepository } from "@/repositories/topics.repository";
import { RecordRecentViewInput } from "@/lib/validation/recent-views";
import { ValidationError } from "@/lib/errors/app-error";

export class RecentViewsService {
  async getRecentViews(userId: string, limit = 20) {
    return await recentViewsRepository.listByUser(userId, limit);
  }

  async recordRecentView(userId: string, data: RecordRecentViewInput) {
    const topic = await topicsRepository.findById(data.topicId, userId);
    if (!topic) {
      throw new ValidationError("Topic not found or does not belong to user");
    }

    return await recentViewsRepository.recordView(userId, data.topicId);
  }
}

export const recentViewsService = new RecentViewsService();
