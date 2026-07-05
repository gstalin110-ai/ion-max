import { MarketplacePage } from "@/src/features/marketplace/marketplace-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MarketplaceRoute() {
  return (
    <ProtectedRoute>
      <MarketplacePage />
    </ProtectedRoute>
  );
}
