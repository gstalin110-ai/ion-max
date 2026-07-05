import { WalletPage } from "@/src/features/wallet/wallet-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function WalletRoute() {
  return (
    <ProtectedRoute>
      <WalletPage />
    </ProtectedRoute>
  );
}
