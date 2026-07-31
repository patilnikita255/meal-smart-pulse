import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarClock, ClipboardList, Utensils } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { KpiCard } from "@/components/fp/kpi-card";
import { StatusBadge } from "@/components/fp/status-badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, addDays, BASE_DATE, formatDate, iso, todayISO, weekdayName } from "@/data/mock";
import { MEAL_TYPES } from "@/data/types";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FoodPulse Student Portal" },
      { name: "description", content: "Your meal plan, today's meals and upcoming subscription status at a glance." },
      { property: "og:title", content: "Dashboard — FoodPulse Student Portal" },
      { property: "og:description", content: "View your subscription, today's meals and notifications." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { currentSubscription, meals, notifications } = useApp();
  const today = todayISO();
  const myMeals = meals.filter((m) => m.studentId === CURRENT_STUDENT_ID);
  const todayMeals = myMeals.filter((m) => m.date === today);
  const remaining = currentSubscription ? currentSubscription.totalMeals - currentSubscription.usedMeals : 0;
  const nextMeal = todayMeals.find((m) => m.selection === "Selected") ?? todayMeals[0];
  const myNotifications = notifications.filter((n) => n.role === "student").slice(0, 5);

  const upcoming = Array.from({ length: 7 }, (_, i) => iso(addDays(BASE_DATE, i)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Here's what's happening with your meal plan today."
        breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Current Plan" value={currentSubscription?.planName ?? "No Plan"} icon={<ClipboardList className="size-4" />} />
        <KpiCard
          label="Subscription Status"
          value={<StatusBadge status={currentSubscription?.status ?? "Pending"} />}
          icon={<CalendarCheck className="size-4" />}
        />
        <KpiCard label="Meals Used" value={currentSubscription?.usedMeals ?? 0} hint="This cycle" icon={<Utensils className="size-4" />} />
        <KpiCard label="Meals Remaining" value={remaining} hint="This cycle" icon={<CalendarClock className="size-4" />} />
        <KpiCard
          label="Next Meal"
          value={nextMeal ? nextMeal.meal : "—"}
          hint={nextMeal ? formatDate(nextMeal.date) : "No meals scheduled"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Today's Meals" description={formatDate(today)} padded>
          {todayMeals.length === 0 ? (
            <EmptyState title="No meals recorded for today" />
          ) : (
            <ul className="space-y-3">
              {MEAL_TYPES.map((mt) => {
                const rec = todayMeals.find((m) => m.meal === mt);
                if (!rec) return null;
                return (
                  <li key={mt} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold">{mt}</p>
                      <p className="text-xs text-muted-foreground">{rec.menu}</p>
                    </div>
                    <StatusBadge status={rec.selection} />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Subscription Progress" description="Meals used vs. total plan meals" padded>
          {currentSubscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold">
                  {currentSubscription.usedMeals} / {currentSubscription.totalMeals} meals
                </span>
              </div>
              <Progress value={(currentSubscription.usedMeals / currentSubscription.totalMeals) * 100} />
              <p className="text-xs text-muted-foreground">
                Plan valid {formatDate(currentSubscription.startDate)} – {formatDate(currentSubscription.endDate)}
              </p>
              <Link to="/student/subscription" className="text-sm font-medium text-primary hover:underline">
                View subscription details →
              </Link>
            </div>
          ) : (
            <EmptyState title="No active subscription" action={<Link to="/student/plans" className="text-sm font-medium text-primary hover:underline">Browse plans</Link>} />
          )}
        </SectionCard>

        <SectionCard title="Recent Notifications" actions={<Link to="/student/notifications" className="text-sm font-medium text-primary hover:underline">View all</Link>} padded>
          {myNotifications.length === 0 ? (
            <EmptyState title="No notifications yet" />
          ) : (
            <ul className="space-y-3">
              {myNotifications.map((n) => (
                <li key={n.id} className="flex items-start gap-2">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Upcoming Meals (Next 7 Days)" description="Click a day to manage selections" actions={<Link to="/student/meal-calendar" className="text-sm font-medium text-primary hover:underline">Open calendar →</Link>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {upcoming.map((date) => {
            const dayMeals = myMeals.filter((m) => m.date === date);
            const locked = date <= today;
            return (
              <Link
                key={date}
                to="/student/meal-calendar"
                className="rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary-soft/30"
              >
                <p className="text-sm font-semibold">{weekdayName(date)}</p>
                <p className="mb-2 text-xs text-muted-foreground">{formatDate(date)}</p>
                <div className="space-y-1.5">
                  {MEAL_TYPES.map((mt) => {
                    const rec = dayMeals.find((m) => m.meal === mt);
                    const status = locked ? "Locked" : rec?.selection ?? "Selected";
                    return (
                      <div key={mt} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{mt}</span>
                        <StatusBadge status={status} className="px-1.5 py-0" />
                      </div>
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
