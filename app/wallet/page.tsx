import { WalletPage } from "@/src/features/wallet/wallet-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function WalletRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <WalletPage />
      </AppShell>
    </ProtectedRoute>
  );
}
