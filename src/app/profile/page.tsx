import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { profileService } from "@/services/profile.service";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/profile");
  }

  const profile = await profileService.getProfile(session.user.id);

  return (
    <AppLayout
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      }}
    >
      <ProfileClient
        user={{
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          createdAt: session.user.createdAt.toString(),
        }}
        initialProfile={{
          fullName: profile?.fullName || session.user.name,
          avatarUrl: profile?.avatarUrl || null,
        }}
      />
    </AppLayout>
  );
}
