import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
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
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatMoney, monthlyTrends } from "@/data/mock";
import {
  CreditCard,
  IndianRupee,
  ListChecks,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | FoodPulse" },
      { name: "description", content: "Organisation-wide KPIs, trends and audit activity for FoodPulse administrators." },
      { property: "og:title", content: "Admin Dashboard | FoodPulse" },
      { property: "og:description", content: "Organisation-wide KPIs, trends and audit activity for FoodPulse administrators." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { users, subscriptions, plans, payments, consumption, auditLogs } = useApp();

  const kpis = useMemo(() => {
    const students = users.filter((u) => u.role === "student");
    const activeSubs = subscriptions.filter((s) => s.status === "Active").length;
    const managers = users.filter((u) => u.role === "manager");
    const activePlans = plans.filter((p) => p.status === "Active").length;
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter((p) => p.status === "Unpaid").length;
    return {
      students: students.length,
      activeSubs,
      managers: managers.length,
      activePlans,
      totalPayments,
      pendingPayments,
    };
  }, [users, subscriptions, plans, payments]);

  const mealDemand = useMemo(() => {
    const byDate = new Map<string, { date: string; expected: number; prepared: number; consumed: number }>();
    consumption
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .forEach((c) => {
        const cur = byDate.get(c.date) ?? { date: c.date, expected: 0, prepared: 0, consumed: 0 };
        cur.expected += c.expected;
        cur.prepared += c.prepared;
        cur.consumed += c.consumed;
        byDate.set(c.date, cur);
      });
    return Array.from(byDate.values());
  }, [consumption]);

  const wastage = useMemo(() => {
    return mealDemand.map((d) => ({
      date: d.date.slice(5),
      wastagePct: d.prepared > 0 ? Number((((d.prepared - d.consumed) / d.prepared) * 100).toFixed(1)) : 0,
    }));
  }, [mealDemand]);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Organisation-wide overview of users, subscriptions, revenue and operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Students" value={kpis.students} icon={<Users className="size-4" />} />
        <KpiCard label="Active Subscribers" value={kpis.activeSubs} icon={<ListChecks className="size-4" />} />
        <KpiCard label="Mess Managers" value={kpis.managers} icon={<ShieldCheck className="size-4" />} />
        <KpiCard label="Active Plans" value={kpis.activePlans} icon={<Package className="size-4" />} />
        <KpiCard label="Total Payments" value={formatMoney(kpis.totalPayments)} icon={<IndianRupee className="size-4" />} />
        <KpiCard
          label="Pending Payments"
          value={kpis.pendingPayments}
          icon={<CreditCard className="size-4" />}
          hint="unpaid invoices"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="User & Subscription Growth" description="Monthly registered users vs active subscriptions">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" name="Users" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="var(--chart-2)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Revenue Trend" description="Monthly collected revenue (₹)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Meal Demand" description="Expected vs prepared vs consumed (last 14 days)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mealDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="expected" name="Expected" fill="var(--chart-1)" />
              <Bar dataKey="prepared" name="Prepared" fill="var(--chart-2)" />
              <Bar dataKey="consumed" name="Consumed" fill="var(--chart-4)" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Wastage Overview" description="Daily wastage % (prepared vs consumed)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={wastage}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="wastagePct" name="Wastage %" stroke="var(--chart-5)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent Audit Activity"
          description="Latest actions across the platform"
          actions={
            <Link to="/admin/audit-logs" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {auditLogs.length === 0 ? (
            <EmptyState title="No audit activity yet" description="Actions performed by admins and managers will show here." />
          ) : (
            <ul className="divide-y divide-border">
              {auditLogs.slice(0, 8).map((log) => (
                <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{log.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {log.user} · {log.module} · {log.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    <StatusBadge status={log.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
