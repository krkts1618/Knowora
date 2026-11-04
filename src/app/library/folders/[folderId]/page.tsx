import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { foldersService } from "@/services/folders.service";
import { documentsRepository } from "@/repositories/documents.repository";
import { AppLayout } from "@/components/layout/AppLayout";
import { LibraryView } from "@/components/library/LibraryView";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/library");
  }

  const { folderId } = await params;
  const userId = session.user.id;

  // Validate folder ownership and existence
  let folder;
  let breadcrumbPath = [];
  try {
    [folder, breadcrumbPath] = await Promise.all([
      foldersService.getFolderById(folderId, userId),
      foldersService.getFolderPath(folderId, userId),
    ]);
  } catch {
    notFound();
  }

  // Fetch child folders and documents inside this folder in parallel
  const [childFolders, childDocuments, allFolders] = await Promise.all([
    foldersService.getFolders(userId, folderId),
    documentsRepository.listByUser(userId, {
      folderId,
      limit: 100,
      offset: 0,
    }),
    foldersService.getAllFolders(userId),
  ]);

  return (
    <AppLayout
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      }}
    >
      <LibraryView
        currentFolder={{
          id: folder.id,
          name: folder.name,
          parentFolderId: folder.parentFolderId,
        }}
        breadcrumbPath={breadcrumbPath.map((node) => ({
          id: node.id,
          name: node.name,
          href: `/library/folders/${node.id}`,
        }))}
        initialFolders={childFolders.map((f) => ({
          id: f.id,
          name: f.name,
          parentFolderId: f.parentFolderId,
          documentCount: f.documentCount,
          subfolderCount: f.subfolderCount,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))}
        initialDocuments={childDocuments.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          folderId: d.folderId,
          sourceType: d.sourceType,
          topicCount: d.topicCount,
          originalFileName: d.originalFileName,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        }))}
        allFolders={allFolders.map((f) => ({
          id: f.id,
          name: f.name,
          parentFolderId: f.parentFolderId,
        }))}
      />
    </AppLayout>
  );
}
