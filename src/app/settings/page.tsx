import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { preferencesService } from "@/services/preferences.service";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?redirectTo=/settings");
  }

  const preferences = await preferencesService.getPreferences(session.user.id);

  return (
    <AppLayout
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image,
      }}
    >
      <SettingsClient
        initialTheme={preferences?.theme || "system"}
        initialEditorPreferences={
          (preferences?.editorPreferences as Record<string, unknown>) || {}
        }
        initialKeyboardShortcuts={
          (preferences?.keyboardShortcuts as Record<string, unknown>) || {}
        }
      />
    </AppLayout>
  );
}
