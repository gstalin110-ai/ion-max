import { CheckoutPage } from "@/src/features/marketplace/checkout-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function CheckoutRoute() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
