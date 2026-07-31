import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/fp/dashboard-layout";

export const Route = createFileRoute("/manager")({
  component: ManagerLayout,
});

function ManagerLayout() {
  return (
    <DashboardLayout role="manager">
      <Outlet />
    </DashboardLayout>
  );
}
