import { MessagesPage } from "@/src/features/messages/messages-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MessagesRoute() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  );
}
