import { PublicProfilePage } from "@/src/features/profile/public-profile";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function PublicProfileRoute({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <PublicProfilePage userId={params.id} />
    </ProtectedRoute>
  );
}
