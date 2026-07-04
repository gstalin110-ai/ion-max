import { MarketplacePage } from "@/src/features/marketplace/marketplace-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MarketplaceRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MarketplacePage />
      </AppShell>
    </ProtectedRoute>
  );
}
