import { CartPage } from "@/src/features/marketplace/cart-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function CartRoute() {
  return (
    <ProtectedRoute>
      <CartPage />
    </ProtectedRoute>
  );
}
