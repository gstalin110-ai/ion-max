import { OrdersPage } from "@/src/features/marketplace/orders-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function OrdersRoute() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
}
