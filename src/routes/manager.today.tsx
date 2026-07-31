import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatDate, todayISO } from "@/data/mock";
import { MEAL_TYPES } from "@/data/types";
import { wastagePct } from "@/components/fp/manager/analytics-utils";

export const Route = createFileRoute("/manager/today")({
  head: () => ({
    meta: [
      { title: "Today's Meals — FoodPulse Mess Manager" },
      { name: "description", content: "Operational status of expected, prepared, consumed and wasted meals for today." },
      { property: "og:title", content: "Today's Meals — FoodPulse Mess Manager" },
      { property: "og:description", content: "Track meal preparation and wastage for each meal today." },
    ],
  }),
  component: TodayMeals,
});

function statusFor(pct: number): { label: string; tone: "success" | "warning" | "danger"; icon: JSX.Element } {
  if (pct <= 8) return { label: "Good", tone: "success", icon: <CheckCircle2 className="size-4" /> };
  if (pct <= 15) return { label: "Warning", tone: "warning", icon: <TrendingDown className="size-4" /> };
  return { label: "High Wastage", tone: "danger", icon: <AlertTriangle className="size-4" /> };
}

function TodayMeals() {
  const { consumption } = useApp();
  const today = todayISO();
  const records = consumption.filter((c) => c.date === today);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Meals"
        description={`Operational status for ${formatDate(today)}`}
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Today's Meals" }]}
        actions={
          <Link to="/manager/consumption" className="text-sm font-medium text-primary hover:underline">
            Go to consumption entry →
          </Link>
        }
      />

      {records.length === 0 ? (
        <SectionCard>
          <EmptyState
            title="No consumption data for today"
            description="Enter today's meal data on the consumption entry screen."
            action={
              <Link to="/manager/consumption" className="text-sm font-medium text-primary hover:underline">
                Enter consumption data
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEAL_TYPES.map((mt) => {
            const rec = records.find((c) => c.meal === mt);
            if (!rec) {
              return (
                <SectionCard key={mt} title={mt} padded>
                  <EmptyState title="No entry yet" />
                </SectionCard>
              );
            }
            const wasted = rec.prepared - rec.consumed;
            const pct = wastagePct(rec.prepared, rec.consumed);
            const status = statusFor(pct);
            return (
              <SectionCard key={mt} title={mt} actions={<StatusBadge status={status.label} tone={status.tone} icon={status.icon} />} padded>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Expected</span><span className="font-semibold">{rec.expected}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Prepared</span><span className="font-semibold">{rec.prepared}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Consumed</span><span className="font-semibold">{rec.consumed}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Wasted</span><span className="font-semibold">{wasted}</span></div>
                  <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Wastage %</span><span className="font-semibold">{pct.toFixed(1)}%</span></div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
