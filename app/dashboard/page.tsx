import { DashboardPage } from "@/src/features/dashboard/dashboard-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function DashboardRoute() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
