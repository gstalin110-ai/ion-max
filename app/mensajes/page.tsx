import { SocialMessagesPage } from "@/src/features/messages/social-messages-page";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MensajesRoute() {
  return (
    <ProtectedRoute>
      <SocialMessagesPage />
    </ProtectedRoute>
  );
}
