import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — FoodPulse Student Portal" },
      { name: "description", content: "All your FoodPulse notifications in one place." },
      { property: "og:title", content: "Notifications — FoodPulse Student Portal" },
      { property: "og:description", content: "Stay updated on meals, payments and complaints." },
    ],
  }),
  component: NotificationsPage,
});

const ICONS: Record<string, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};
const TONE: Record<string, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-accent-foreground",
  error: "bg-destructive/10 text-destructive",
  info: "bg-info/12 text-info",
};

function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const [tab, setTab] = useState("all");

  const list = notifications.filter((n) => n.role === "student");
  const shown = tab === "unread" ? list.filter((n) => !n.read) : list;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about your meals, payments and complaints."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Notifications" }]}
        actions={<Button variant="outline" onClick={() => markAllRead("student")}>Mark all as read</Button>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({list.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({list.filter((n) => !n.read).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <SectionCard padded={false}>
        {shown.length === 0 ? (
          <EmptyState icon={<Bell className="size-6" />} title="No notifications" description={tab === "unread" ? "You're all caught up." : "Nothing here yet."} />
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((n) => {
              const Icon = ICONS[n.type] ?? Info;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className={cn("flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-muted/50", !n.read && "bg-primary-soft/30")}
                  >
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", TONE[n.type])}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{n.title}</p>
                        {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
