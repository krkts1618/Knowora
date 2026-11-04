import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { foldersService } from "@/services/folders.service";
import { documentsRepository } from "@/repositories/documents.repository";
import { AppLayout } from "@/components/layout/AppLayout";
import { LibraryView } from "@/components/library/LibraryView";

export default async function LibraryPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/library");
  }

  const userId = session.user.id;

  // Fetch root-level folders, root-level documents, and all user folders in parallel
  const [rootFolders, rootDocuments, allFolders] = await Promise.all([
    foldersService.getFolders(userId, null),
    documentsRepository.listByUser(userId, {
      folderId: null,
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
        currentFolder={null}
        breadcrumbPath={[]}
        initialFolders={rootFolders.map((f) => ({
          id: f.id,
          name: f.name,
          parentFolderId: f.parentFolderId,
          documentCount: f.documentCount,
          subfolderCount: f.subfolderCount,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))}
        initialDocuments={rootDocuments.map((d) => ({
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
