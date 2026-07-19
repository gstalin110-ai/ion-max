import { CheckoutConfirmationPage } from "@/src/features/marketplace/checkout-confirmation-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function CheckoutConfirmationRoute() {
  return (
    <ProtectedRoute>
      <CheckoutConfirmationPage />
    </ProtectedRoute>
  );
}
