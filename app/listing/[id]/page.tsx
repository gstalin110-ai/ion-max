import { ListingDetailPage } from "@/src/features/marketplace/listing-detail-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function ListingRoute({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <ListingDetailPage listingId={params.id} />
    </ProtectedRoute>
  );
}
