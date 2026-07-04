import { ProfilePage } from "@/src/features/profile/profile-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function ProfileRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ProfilePage />
      </AppShell>
    </ProtectedRoute>
  );
}
