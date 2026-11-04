import { topicsRepository } from "@/repositories/topics.repository";
import { documentsRepository } from "@/repositories/documents.repository";
import {
  CreateTopicInput,
  UpdateTopicInput,
  CreateTopicVersionInput,
  createTopicSchema,
  updateTopicSchema,
} from "@/lib/validation/topics";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/errors/app-error";
import { createPaginatedResult } from "@/lib/utils/pagination";

export class TopicsService {
  async getTopics(
    userId: string,
    options: {
      documentId?: string;
      page: number;
      pageSize: number;
    }
  ) {
    const limit = options.pageSize;
    const offset = (options.page - 1) * options.pageSize;

    const [items, total] = await Promise.all([
      topicsRepository.listByUser(userId, {
        documentId: options.documentId,
        limit,
        offset,
      }),
      topicsRepository.countByUser(userId, options.documentId),
    ]);

    return createPaginatedResult(items, total, options.page, options.pageSize);
  }

  async getTopicsByDocument(
    documentId: string,
    userId: string,
    parentTopicId?: string | null
  ) {
    const doc = await documentsRepository.findById(documentId, userId);
    if (!doc) {
      throw new NotFoundError("Document not found");
    }

    return await topicsRepository.listByDocument(documentId, userId, parentTopicId);
  }

  async getTopicById(id: string, userId: string) {
    const topic = await topicsRepository.findById(id, userId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }
    return topic;
  }

  async createTopic(userId: string, rawData: CreateTopicInput) {
    const data = createTopicSchema.parse(rawData);
    // 1. Verify document belongs to user
    const doc = await documentsRepository.findById(data.documentId, userId);
    if (!doc) {
      throw new ValidationError("Document not found or does not belong to user");
    }

    // 2. If parent topic provided, verify it belongs to same document and same user
    if (data.parentTopicId) {
      const parent = await topicsRepository.findById(data.parentTopicId, userId);
      if (!parent) {
        throw new ValidationError("Parent topic not found or does not belong to user");
      }
      if (parent.documentId !== data.documentId) {
        throw new ValidationError("Parent topic must belong to the same document");
      }
    }

    return await topicsRepository.create({
      userId,
      documentId: data.documentId,
      parentTopicId: data.parentTopicId,
      title: data.title,
      content: data.content,
      plainText: data.plainText,
      position: data.position,
      sourcePageStart: data.sourcePageStart,
      sourcePageEnd: data.sourcePageEnd,
      origin: data.origin,
    });
  }

  async updateTopic(id: string, userId: string, rawData: UpdateTopicInput) {
    const data = updateTopicSchema.parse(rawData);
    const existing = await topicsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Topic not found");
    }

    if (data.parentTopicId !== undefined) {
      if (data.parentTopicId === id) {
        throw new ValidationError("Topic cannot be its own parent");
      }

      if (data.parentTopicId !== null) {
        const parent = await topicsRepository.findById(data.parentTopicId, userId);
        if (!parent) {
          throw new ValidationError("Parent topic not found or does not belong to user");
        }
        if (parent.documentId !== existing.documentId) {
          throw new ValidationError("Parent topic must belong to the same document");
        }

        // Circular reference check
        let currentParentId: string | null = parent.parentTopicId;
        while (currentParentId) {
          if (currentParentId === id) {
            throw new ConflictError("Circular topic hierarchy is not allowed");
          }
          const ancestor = await topicsRepository.findById(currentParentId, userId);
          currentParentId = ancestor ? ancestor.parentTopicId : null;
        }
      }
    }

    const updated = await topicsRepository.update(
      id,
      userId,
      {
        title: data.title,
        content: data.content,
        plainText: data.plainText,
        position: data.position,
        parentTopicId: data.parentTopicId,
      },
      data.createSnapshot ?? true
    );

    return updated;
  }

  async deleteTopic(id: string, userId: string) {
    const existing = await topicsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Topic not found");
    }

    return await topicsRepository.delete(id, userId);
  }

  // Version management
  async getTopicVersions(topicId: string, userId: string) {
    const topic = await topicsRepository.findById(topicId, userId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    return await topicsRepository.getVersions(topicId, userId);
  }

  async createTopicVersion(
    topicId: string,
    userId: string,
    data: CreateTopicVersionInput
  ) {
    const topic = await topicsRepository.findById(topicId, userId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    return await topicsRepository.createVersion(topicId, userId, data);
  }

  async restoreTopicVersion(topicId: string, versionId: string, userId: string) {
    const topic = await topicsRepository.findById(topicId, userId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const restored = await topicsRepository.restoreVersion(topicId, versionId, userId);
    if (!restored) {
      throw new NotFoundError("Target version not found");
    }

    return restored;
  }
}

export const topicsService = new TopicsService();
