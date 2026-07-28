import { PublishPage } from "@/src/features/publish/publish-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function PublishRoute() {
  return (
    <ProtectedRoute>
      <PublishPage />
    </ProtectedRoute>
  );
}
