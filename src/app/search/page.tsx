import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalSearchView } from "@/components/search/GlobalSearchView";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/search");
  }

  const { q } = await searchParams;

  return (
    <AppLayout
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      }}
    >
      <GlobalSearchView initialQuery={q || ""} />
    </AppLayout>
  );
}
