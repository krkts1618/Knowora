import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { documentsService } from "@/services/documents.service";
import { foldersService } from "@/services/folders.service";
import { topicsService } from "@/services/topics.service";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentDetailClient } from "./DocumentDetailClient";

interface DocumentPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/library");
  }

  const { documentId } = await params;
  const userId = session.user.id;

  let document;
  try {
    document = await documentsService.getDocumentById(documentId, userId);
  } catch {
    notFound();
  }

  // Fetch breadcrumb ancestor path, topics, and allFolders in parallel
  const [breadcrumbPath, topics, allFolders] = await Promise.all([
    document.folderId
      ? foldersService.getFolderPath(document.folderId, userId)
      : Promise.resolve([]),
    topicsService.getTopicsByDocument(documentId, userId),
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
      <DocumentDetailClient
        document={{
          id: document.id,
          title: document.title,
          description: document.description,
          folderId: document.folderId,
          sourceType: document.sourceType,
          topicCount: document.topicCount ?? 0,
          originalFileName: document.originalFileName,
          fileSizeBytes: document.fileSizeBytes,
          pageCount: document.pageCount,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
        }}
        breadcrumbPath={breadcrumbPath.map((node) => ({
          id: node.id,
          name: node.name,
        }))}
        topics={topics.map((t) => ({
          id: t.id,
          title: t.title,
          plainText: t.plainText,
          position: t.position,
          origin: t.origin,
          parentTopicId: t.parentTopicId,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
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
