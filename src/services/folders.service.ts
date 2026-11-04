import { foldersRepository } from "@/repositories/folders.repository";
import {
  CreateFolderInput,
  UpdateFolderInput,
  createFolderSchema,
} from "@/lib/validation/folders";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";

export class FoldersService {
  async getFolders(userId: string, parentFolderId?: string | null) {
    return await foldersRepository.listByUser(userId, parentFolderId);
  }

  async getFolderById(id: string, userId: string) {
    const folder = await foldersRepository.findById(id, userId);
    if (!folder) {
      throw new NotFoundError("Folder not found");
    }
    return folder;
  }

  async createFolder(userId: string, rawData: CreateFolderInput) {
    const data = createFolderSchema.parse(rawData);
    if (data.parentFolderId) {
      const parent = await foldersRepository.findById(data.parentFolderId, userId);
      if (!parent) {
        throw new ValidationError("Parent folder not found or does not belong to user");
      }
    }

    return await foldersRepository.create({
      userId,
      name: data.name,
      parentFolderId: data.parentFolderId,
      position: data.position,
    });
  }

  async updateFolder(id: string, userId: string, data: UpdateFolderInput) {
    const existing = await foldersRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Folder not found");
    }

    if (data.parentFolderId !== undefined) {
      if (data.parentFolderId === id) {
        throw new ValidationError("Folder cannot be its own parent");
      }

      if (data.parentFolderId !== null) {
        const parent = await foldersRepository.findById(data.parentFolderId, userId);
        if (!parent) {
          throw new ValidationError("Parent folder not found or does not belong to user");
        }

        // Check for circular reference in folder hierarchy
        let currentParentId: string | null = parent.parentFolderId;
        while (currentParentId) {
          if (currentParentId === id) {
            throw new ConflictError("Circular folder hierarchy is not allowed");
          }
          const ancestor = await foldersRepository.findById(currentParentId, userId);
          currentParentId = ancestor ? ancestor.parentFolderId : null;
        }
      }
    }

    const updated = await foldersRepository.update(id, userId, data);
    return updated;
  }

  async deleteFolder(id: string, userId: string) {
    const existing = await foldersRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Folder not found");
    }

    return await foldersRepository.delete(id, userId);
  }
}

export const foldersService = new FoldersService();
