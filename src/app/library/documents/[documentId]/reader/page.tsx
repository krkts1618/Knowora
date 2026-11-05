import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { documentsRepository } from "@/repositories/documents.repository";
import { topicsRepository } from "@/repositories/topics.repository";
import { PdfReaderView } from "@/components/reader/PdfReaderView";

interface PageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function DocumentPdfReaderPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  const { documentId } = await params;
  const doc = await documentsRepository.findById(documentId, session.user.id);
  if (!doc) {
    notFound();
  }

  const topics = await topicsRepository.listByDocument(documentId, session.user.id);

  return (
    <PdfReaderView
      document={{
        id: doc.id,
        title: doc.title,
        sourceType: doc.sourceType,
        folderId: doc.folderId,
      }}
      topics={topics.map((t) => ({
        id: t.id,
        title: t.title,
      }))}
    />
  );
}
