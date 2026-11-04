import { tagsRepository } from "@/repositories/tags.repository";
import { CreateTagInput, UpdateTagInput, createTagSchema } from "@/lib/validation/tags";
import {
  NotFoundError,
  ConflictError,
} from "@/lib/errors/app-error";

export class TagsService {
  async getTags(userId: string) {
    return await tagsRepository.listByUser(userId);
  }

  async createTag(userId: string, rawData: CreateTagInput) {
    const data = createTagSchema.parse(rawData);
    const existing = await tagsRepository.findByName(data.name, userId);
    if (existing) {
      throw new ConflictError(`Tag '${data.name}' already exists`);
    }

    return await tagsRepository.create({
      userId,
      name: data.name,
      color: data.color,
    });
  }

  async updateTag(id: string, userId: string, data: UpdateTagInput) {
    const existing = await tagsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Tag not found");
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await tagsRepository.findByName(data.name, userId);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Tag '${data.name}' already exists`);
      }
    }

    return await tagsRepository.update(id, userId, data);
  }

  async deleteTag(id: string, userId: string) {
    const existing = await tagsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Tag not found");
    }

    return await tagsRepository.delete(id, userId);
  }
}

export const tagsService = new TagsService();
