import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { KpiCard } from "@/components/fp/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/store/app-store";
import { formatDate, weekdayName } from "@/data/mock";
import { MEAL_TYPES } from "@/data/types";
import { rangeDays, wastagePct } from "@/components/fp/manager/analytics-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager/wastage")({
  head: () => ({
    meta: [
      { title: "Food Wastage — FoodPulse Mess Manager" },
      { name: "description", content: "Analyze daily, meal-wise and weekly food wastage trends." },
      { property: "og:title", content: "Food Wastage — FoodPulse Mess Manager" },
      { property: "og:description", content: "Wastage analytics with charts and range filters." },
    ],
  }),
  component: WastagePage,
});

type RangeKey = "7" | "30" | "custom";

function WastagePage() {
  const { consumption } = useApp();
  const [range, setRange] = useState<RangeKey>("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const dates = useMemo(() => {
    if (range === "custom" && from && to) {
      return consumption.map((c) => c.date).filter((d, i, arr) => arr.indexOf(d) === i && d >= from && d <= to).sort();
    }
    return rangeDays(range === "7" ? 7 : 30);
  }, [range, from, to, consumption]);

  const records = consumption.filter((c) => dates.includes(c.date));

  const totalPrepared = records.reduce((a, c) => a + c.prepared, 0);
  const totalConsumed = records.reduce((a, c) => a + c.consumed, 0);
  const totalWasted = totalPrepared - totalConsumed;
  const avgWastage = records.length ? records.reduce((a, c) => a + wastagePct(c.prepared, c.consumed), 0) / records.length : 0;

  const dailyData = dates.map((d) => {
    const recs = records.filter((c) => c.date === d);
    const prep = recs.reduce((a, c) => a + c.prepared, 0);
    const cons = recs.reduce((a, c) => a + c.consumed, 0);
    return { date: formatDate(d), pct: wastagePct(prep, cons) };
  });

  const mealData = MEAL_TYPES.map((mt) => {
    const recs = records.filter((c) => c.meal === mt);
    const prep = recs.reduce((a, c) => a + c.prepared, 0);
    const cons = recs.reduce((a, c) => a + c.consumed, 0);
    return { meal: mt, pct: wastagePct(prep, cons) };
  });

  const weeklyData = useMemo(() => {
    const byWeekday: Record<string, { prep: number; cons: number }> = {};
    records.forEach((c) => {
      const day = weekdayName(c.date).slice(0, 3);
      byWeekday[day] = byWeekday[day] ?? { prep: 0, cons: 0 };
      byWeekday[day]!.prep += c.prepared;
      byWeekday[day]!.cons += c.consumed;
    });
    const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return order
      .filter((d) => byWeekday[d])
      .map((d) => ({ day: d, pct: wastagePct(byWeekday[d]!.prep, byWeekday[d]!.cons) }));
  }, [records]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food Wastage Analytics"
        description="Understand where and when food is wasted to reduce preparation surplus."
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Food Wastage" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={range === "7" ? "default" : "outline"} size="sm" onClick={() => setRange("7")}>7 days</Button>
            <Button variant={range === "30" ? "default" : "outline"} size="sm" onClick={() => setRange("30")}>30 days</Button>
            <Button variant={range === "custom" ? "default" : "outline"} size="sm" onClick={() => setRange("custom")}>Custom</Button>
            {range === "custom" && (
              <>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" aria-label="From date" />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" aria-label="To date" />
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Prepared" value={totalPrepared} />
        <KpiCard label="Total Consumed" value={totalConsumed} />
        <KpiCard label="Total Wasted" value={totalWasted} />
        <KpiCard label="Average Wastage %" value={`${avgWastage.toFixed(1)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Daily Wastage %" padded>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={12} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="pct" name="Wastage %" stroke="var(--chart-4)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Meal-wise Wastage %" padded>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mealData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="meal" fontSize={12} />
              <YAxis fontSize={12} unit="%" />
              <Tooltip />
              <Bar dataKey="pct" name="Wastage %" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Weekly Wastage % by Weekday" padded>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip />
            <Bar dataKey="pct" name="Wastage %" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}
