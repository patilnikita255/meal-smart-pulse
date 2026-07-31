import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ClipboardList, CreditCard, Sparkles, Trash2, Users, UtensilsCrossed } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { KpiCard } from "@/components/fp/kpi-card";
import { StatusBadge } from "@/components/fp/status-badge";
import { useApp } from "@/store/app-store";
import { addDays, BASE_DATE, formatDate, iso, todayISO, weekdayName } from "@/data/mock";
import { MEAL_TYPES } from "@/data/types";
import { last7Days, wastagePct } from "@/components/fp/manager/analytics-utils";

export const Route = createFileRoute("/manager/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FoodPulse Mess Manager" },
      { name: "description", content: "Operational overview of subscribers, meal demand, wastage and smart recommendations." },
      { property: "og:title", content: "Dashboard — FoodPulse Mess Manager" },
      { property: "og:description", content: "Today's meal demand, weekly trends and wastage summary." },
    ],
  }),
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const { subscriptions, consumption } = useApp();
  const today = todayISO();
  const tomorrow = iso(addDays(BASE_DATE, 1));

  const activeSubs = subscriptions.filter((s) => s.status === "Active").length;
  const pendingPayments = subscriptions.filter((s) => s.paymentStatus === "Unpaid").length;

  const todayRecords = consumption.filter((c) => c.date === today);
  const todayTotal = todayRecords.reduce((a, c) => a + c.consumed, 0);
  const mealCount = (meal: string) => todayRecords.find((c) => c.meal === meal)?.consumed ?? 0;

  const days = last7Days();
  const trend = days.map((d) => {
    const recs = consumption.filter((c) => c.date === d);
    const row: Record<string, number | string> = { day: weekdayName(d).slice(0, 3), date: d };
    MEAL_TYPES.forEach((mt) => {
      row[mt] = recs.find((c) => c.meal === mt)?.consumed ?? 0;
    });
    return row;
  });

  const totalPrepared = todayRecords.reduce((a, c) => a + c.prepared, 0);
  const totalConsumed = todayRecords.reduce((a, c) => a + c.consumed, 0);
  const wastage = wastagePct(totalPrepared, totalConsumed);

  // Tomorrow expected demand: simple estimate from 7-day rolling average per meal
  const tomorrowExpected = MEAL_TYPES.map((mt) => {
    const recs = consumption.filter((c) => c.meal === mt).slice(-7);
    const avg = recs.length ? Math.round(recs.reduce((a, c) => a + c.consumed, 0) / recs.length) : 0;
    return { meal: mt, avg };
  });

  // Smart recommendation: weekend dinner vs weekday dinner average
  const dinnerRecords = consumption.filter((c) => c.meal === "Dinner");
  const weekendDinner = dinnerRecords.filter((c) => {
    const dow = new Date(c.date + "T00:00:00").getDay();
    return dow === 0 || dow === 6;
  });
  const weekdayDinner = dinnerRecords.filter((c) => {
    const dow = new Date(c.date + "T00:00:00").getDay();
    return dow !== 0 && dow !== 6;
  });
  const avgWeekend = weekendDinner.length ? weekendDinner.reduce((a, c) => a + c.consumed, 0) / weekendDinner.length : 0;
  const avgWeekday = weekdayDinner.length ? weekdayDinner.reduce((a, c) => a + c.consumed, 0) / weekdayDinner.length : 0;
  const diffPct = avgWeekday > 0 ? Math.round(((avgWeekday - avgWeekend) / avgWeekday) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Manager Dashboard"
        description="Operational snapshot for today's meal service."
        breadcrumbs={[{ label: "Manager" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Subscribers" value={activeSubs} icon={<Users className="size-4" />} />
        <KpiCard label="Today's Total Meals" value={todayTotal} icon={<UtensilsCrossed className="size-4" />} />
        <KpiCard label="Breakfast" value={mealCount("Breakfast")} hint="Consumed today" />
        <KpiCard label="Lunch" value={mealCount("Lunch")} hint="Consumed today" />
        <KpiCard label="Dinner" value={mealCount("Dinner")} hint="Consumed today" />
        <KpiCard
          label="Pending Payments"
          value={pendingPayments}
          icon={<CreditCard className="size-4" />}
          hint={<Link to="/manager/payments" className="text-primary hover:underline">Review</Link>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Weekly Meal Trend" description="Meals consumed per day, last 7 days" padded className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Breakfast" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="Lunch" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="Dinner" stroke="var(--chart-3)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Wastage Summary" description={`Today — ${formatDate(today)}`} padded>
          <div className="space-y-3">
            <p className="font-display text-3xl font-semibold">{wastage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">
              {totalPrepared} prepared vs {totalConsumed} consumed across all meals today.
            </p>
            <StatusBadge status={wastage > 12 ? "High Wastage" : wastage > 8 ? "Moderate" : "Within Target"} tone={wastage > 12 ? "danger" : wastage > 8 ? "warning" : "success"} />
            <Link to="/manager/wastage" className="block text-sm font-medium text-primary hover:underline">
              View wastage analytics →
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Today's Meal Demand" description={formatDate(today)} padded>
          <ul className="space-y-3">
            {MEAL_TYPES.map((mt) => {
              const rec = todayRecords.find((c) => c.meal === mt);
              return (
                <li key={mt} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-semibold">{mt}</span>
                  <span className="text-sm text-muted-foreground">{rec ? `${rec.consumed} / ${rec.prepared} prepared` : "No data"}</span>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Tomorrow's Expected Demand" description={formatDate(tomorrow)} padded>
          <ul className="space-y-3">
            {tomorrowExpected.map((r) => (
              <li key={r.meal} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-semibold">{r.meal}</span>
                <span className="text-sm text-muted-foreground">~{r.avg} meals (7-day avg)</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Smart Recommendation" padded>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Weekend dinner demand lower</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Weekend dinner demand is {Math.abs(diffPct)}% {diffPct >= 0 ? "lower" : "higher"} than the weekday average
                ({Math.round(avgWeekend)} vs {Math.round(avgWeekday)} meals). Consider adjusting Friday/Saturday preparation
                quantities to reduce wastage.
              </p>
              <Link to="/manager/analytics" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                Open Smart Analytics →
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
