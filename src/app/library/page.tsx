import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { MainWorkspace } from "@/components/views/MainWorkspace";

export default async function LibraryPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/library");
  }

  return <MainWorkspace />;
}
