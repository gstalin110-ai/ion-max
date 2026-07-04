import { DashboardPage } from "@/src/features/dashboard/dashboard-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function DashboardRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <DashboardPage />
      </AppShell>
    </ProtectedRoute>
  );
}
