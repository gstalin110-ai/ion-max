import { ProfilePage } from "@/src/features/profile/profile-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function ProfileRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
