import { AdminDashboard } from "@/src/features/admin/admin-dashboard";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function AdminRoute() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
