import { SettingsPage } from "@/src/features/settings/settings-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function SettingsRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <SettingsPage />
      </AppShell>
    </ProtectedRoute>
  );
}
