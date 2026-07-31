import { UsersPage } from "@/src/features/users/users-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function UsersRoute() {
  return (
    <ProtectedRoute>
      <UsersPage />
    </ProtectedRoute>
  );
}
