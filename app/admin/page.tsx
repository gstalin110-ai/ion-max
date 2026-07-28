import { AdminDashboard } from "@/src/features/admin/admin-dashboard";
import { AdminRoute } from "@/src/components/admin-route";

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
