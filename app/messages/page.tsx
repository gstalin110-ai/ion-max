// Módulo de Chat IA deshabilitado temporalmente
// Se reintegrará cuando el núcleo del ecosistema sea estable
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MessagesRoute() {
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center">
          <p className="text-2xl font-black text-white mb-4">Centro de Inteligencia Artificial</p>
          <p className="text-zinc-400">Esta funcionalidad estará disponible en futuras actualizaciones.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
