import { bookmarksRepository } from "@/repositories/bookmarks.repository";
import { topicsRepository } from "@/repositories/topics.repository";
import { CreateBookmarkInput } from "@/lib/validation/bookmarks";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";

export class BookmarksService {
  async getBookmarks(userId: string) {
    return await bookmarksRepository.listByUser(userId);
  }

  async createBookmark(userId: string, data: CreateBookmarkInput) {
    const topic = await topicsRepository.findById(data.topicId, userId);
    if (!topic) {
      throw new ValidationError("Topic not found or does not belong to user");
    }

    return await bookmarksRepository.create(userId, data.topicId);
  }

  async deleteBookmark(id: string, userId: string) {
    const existing = await bookmarksRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Bookmark not found");
    }

    return await bookmarksRepository.delete(id, userId);
  }
}

export const bookmarksService = new BookmarksService();
