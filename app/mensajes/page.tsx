import { SocialMessagesPage } from "@/src/features/messages/social-messages-page";
import { AppShell } from "@/src/components/layout/app-shell";

export default function MensajesRoute() {
  return (
    <AppShell>
      <SocialMessagesPage />
    </AppShell>
  );
}
