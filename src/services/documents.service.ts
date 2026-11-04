import { documentsRepository } from "@/repositories/documents.repository";
import { foldersRepository } from "@/repositories/folders.repository";
import {
  CreateDocumentInput,
  UpdateDocumentInput,
  DeleteDocumentInput,
  createDocumentSchema,
} from "@/lib/validation/documents";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { createPaginatedResult } from "@/lib/utils/pagination";

export class DocumentsService {
  async getDocuments(
    userId: string,
    options: {
      folderId?: string | null;
      page: number;
      pageSize: number;
    }
  ) {
    const limit = options.pageSize;
    const offset = (options.page - 1) * options.pageSize;

    const [items, total] = await Promise.all([
      documentsRepository.listByUser(userId, {
        folderId: options.folderId,
        limit,
        offset,
      }),
      documentsRepository.countByUser(userId, options.folderId),
    ]);

    return createPaginatedResult(items, total, options.page, options.pageSize);
  }

  async getDocumentById(id: string, userId: string) {
    const document = await documentsRepository.findById(id, userId);
    if (!document) {
      throw new NotFoundError("Document not found");
    }
    return document;
  }

  async createDocument(userId: string, rawData: CreateDocumentInput) {
    const data = createDocumentSchema.parse(rawData);
    if (data.folderId) {
      const folder = await foldersRepository.findById(data.folderId, userId);
      if (!folder) {
        throw new ValidationError("Folder not found or does not belong to user");
      }
    }

    return await documentsRepository.create({
      userId,
      title: data.title,
      description: data.description,
      folderId: data.folderId,
      sourceType: data.sourceType,
      originalFileKey: data.originalFileKey,
      originalFileName: data.originalFileName,
      fileSizeBytes: data.fileSizeBytes,
      mimeType: data.mimeType,
      pageCount: data.pageCount,
    });
  }

  async updateDocument(id: string, userId: string, data: UpdateDocumentInput) {
    const existing = await documentsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Document not found");
    }

    if (data.folderId) {
      const folder = await foldersRepository.findById(data.folderId, userId);
      if (!folder) {
        throw new ValidationError("Target folder not found or does not belong to user");
      }
    }

    return await documentsRepository.update(id, userId, data);
  }

  async deleteDocument(id: string, userId: string, options: DeleteDocumentInput) {
    const existing = await documentsRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Document not found");
    }

    if (options.strategy === "pdf_only") {
      return await documentsRepository.deletePdfOnly(id, userId);
    } else {
      return await documentsRepository.deleteComplete(id, userId);
    }
  }
}

export const documentsService = new DocumentsService();
