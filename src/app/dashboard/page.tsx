import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { documentsRepository } from "@/repositories/documents.repository";
import { foldersRepository } from "@/repositories/folders.repository";
import { topicsRepository } from "@/repositories/topics.repository";
import { bookmarksRepository } from "@/repositories/bookmarks.repository";
import { recentViewsRepository } from "@/repositories/recent-views.repository";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const userId = session.user.id;

  // Real database queries in parallel
  const [
    docCount,
    folderCount,
    topicCount,
    bookmarkCount,
    recentDocs,
    recentViews,
    bookmarksList,
  ] = await Promise.all([
    documentsRepository.countByUser(userId),
    foldersRepository.countByUser(userId),
    topicsRepository.countByUser(userId),
    bookmarksRepository.countByUser(userId),
    documentsRepository.listByUser(userId, { limit: 5, offset: 0 }),
    recentViewsRepository.listByUser(userId, 5),
    bookmarksRepository.listByUser(userId),
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
      <DashboardClient
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
        metrics={{
          docCount,
          folderCount,
          topicCount,
          bookmarkCount,
        }}
        recentDocs={recentDocs.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          folderId: d.folderId,
          createdAt: d.createdAt.toISOString(),
        }))}
        recentViews={recentViews.map((rv) => ({
          id: rv.id,
          topicId: rv.topicId,
          topicTitle: rv.topicTitle,
          documentId: rv.documentId,
          documentTitle: rv.documentTitle,
          viewedAt: rv.viewedAt.toISOString(),
        }))}
        bookmarksList={bookmarksList.map((bm) => ({
          id: bm.id,
          topicId: bm.topicId,
          topicTitle: bm.topicTitle,
          documentId: bm.documentId,
          documentTitle: bm.documentTitle,
          createdAt: bm.createdAt.toISOString(),
        }))}
      />
    </AppLayout>
  );
}
