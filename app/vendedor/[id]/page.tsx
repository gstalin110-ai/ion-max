import { SellerProfilePage } from "@/src/features/marketplace/seller-profile-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function SellerProfileRoute({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <SellerProfilePage sellerId={params.id} />
    </ProtectedRoute>
  );
}
