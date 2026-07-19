import { ComparePage } from "@/src/features/marketplace/compare-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function CompareRoute() {
  return (
    <ProtectedRoute>
      <ComparePage />
    </ProtectedRoute>
  );
}
