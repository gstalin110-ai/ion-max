import { ComunidadPage } from "@/src/features/comunidad/comunidad-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function ComunidadRoute() {
  return (
    <ProtectedRoute>
      <ComunidadPage />
    </ProtectedRoute>
  );
}
