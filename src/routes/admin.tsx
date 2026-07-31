import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/fp/dashboard-layout";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardLayout role="admin">
      <Outlet />
    </DashboardLayout>
  );
}
