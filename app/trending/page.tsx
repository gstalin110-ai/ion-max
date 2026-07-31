import { TrendingPage } from "@/src/features/trending/trending-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function TrendingRoute() {
  return (
    <ProtectedRoute>
      <TrendingPage />
    </ProtectedRoute>
  );
}
