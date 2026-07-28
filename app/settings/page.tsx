import { SettingsPage } from "@/src/features/settings/settings-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function SettingsRoute() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}
