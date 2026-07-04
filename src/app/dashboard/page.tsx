import { DashboardPage } from "@/src/features/dashboard/dashboard-page";
import { AppShell } from "@/src/components/layout/app-shell";

export default function DashboardRoute() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}
