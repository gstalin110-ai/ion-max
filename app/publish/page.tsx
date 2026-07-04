import { PublishPage } from "@/src/features/publish/publish-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function PublishRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PublishPage />
      </AppShell>
    </ProtectedRoute>
  );
}
