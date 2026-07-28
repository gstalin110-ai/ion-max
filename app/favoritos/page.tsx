import { WishlistPage } from "@/src/features/marketplace/wishlist-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function WishlistRoute() {
  return (
    <ProtectedRoute>
      <WishlistPage />
    </ProtectedRoute>
  );
}
