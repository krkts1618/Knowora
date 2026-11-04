import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { documentsService } from "@/services/documents.service";
import { foldersService } from "@/services/folders.service";
import { topicsService } from "@/services/topics.service";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentWorkspaceClient } from "@/components/editor/DocumentWorkspaceClient";

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

  // Fetch breadcrumb ancestor path and topics in parallel
  const [breadcrumbPath, topics] = await Promise.all([
    document.folderId
      ? foldersService.getFolderPath(document.folderId, userId)
      : Promise.resolve([]),
    topicsService.getTopicsByDocument(documentId, userId),
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
      <DocumentWorkspaceClient
        document={{
          id: document.id,
          title: document.title,
          description: document.description,
          folderId: document.folderId,
          sourceType: document.sourceType,
          updatedAt: document.updatedAt.toISOString(),
        }}
        breadcrumbPath={breadcrumbPath.map((node) => ({
          id: node.id,
          name: node.name,
        }))}
        initialTopics={topics.map((t) => ({
          id: t.id,
          title: t.title,
          documentId: t.documentId,
          parentTopicId: t.parentTopicId,
          position: t.position,
          plainText: t.plainText,
          content: (t.content as Record<string, unknown>) || undefined,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }))}
      />
    </AppLayout>
  );
}
