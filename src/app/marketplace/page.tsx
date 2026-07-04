import { MarketplacePage } from "@/src/features/marketplace/marketplace-page";
import { AppShell } from "@/src/components/layout/app-shell";

export default function MarketplaceRoute() {
  return (
    <AppShell>
      <MarketplacePage />
    </AppShell>
  );
}
