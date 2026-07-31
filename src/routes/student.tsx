import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/fp/dashboard-layout";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <DashboardLayout role="student">
      <Outlet />
    </DashboardLayout>
  );
}
