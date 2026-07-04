import { MessagesPage } from "@/src/features/messages/messages-page";
import { AppShell } from "@/src/components/layout/app-shell";
import { ProtectedRoute } from "@/src/components/protected-route";

export default function MessagesRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MessagesPage />
      </AppShell>
    </ProtectedRoute>
  );
}
