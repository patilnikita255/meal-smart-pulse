import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { KpiCard } from "@/components/fp/kpi-card";
import { StatusBadge } from "@/components/fp/status-badge";
import { EmptyState, TableSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import { formatDate } from "@/data/mock";
import type { Subscription, SubscriptionStatus } from "@/data/types";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions | FoodPulse Admin" },
      { name: "description", content: "View and manage all student subscriptions, pauses and cancellations." },
      { property: "og:title", content: "Subscriptions | FoodPulse Admin" },
      { property: "og:description", content: "View and manage all student subscriptions, pauses and cancellations." },
    ],
  }),
  component: AdminSubscriptionsPage,
});

const STATUS_OPTIONS: SubscriptionStatus[] = ["Active", "Expired", "Cancelled", "Paused", "Pending"];

function AdminSubscriptionsPage() {
  const { subscriptions, updateSubscription, logAction } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | SubscriptionStatus>("all");
  const [detail, setDetail] = useState<Subscription | null>(null);

  const summary = useMemo(() => {
    const byStatus = (s: SubscriptionStatus) => subscriptions.filter((sub) => sub.status === s).length;
    return {
      active: byStatus("Active"),
      expired: byStatus("Expired"),
      cancelled: byStatus("Cancelled"),
      paused: byStatus("Paused"),
      pending: byStatus("Pending"),
    };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch =
        !search ||
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.planName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || s.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, status]);

  function approveRequest(sub: Subscription, action: "pause" | "cancel") {
    updateSubscription(sub.id, {
      status: action === "pause" ? "Paused" : "Cancelled",
      requestStatus: null,
    });
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: action === "pause" ? "Approved pause" : "Approved cancellation",
      module: "Subscriptions",
      description: `${sub.id} ${action === "pause" ? "paused" : "cancellation approved"} for ${sub.studentName}`,
      status: "Success",
    });
    toast.success(`${action === "pause" ? "Pause" : "Cancellation"} approved for ${sub.studentName}`);
    setDetail(null);
  }

  return (
    <div>
      <PageHeader title="Subscriptions" description="All student subscriptions across every plan." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Active" value={summary.active} />
        <KpiCard label="Expired" value={summary.expired} />
        <KpiCard label="Cancelled" value={summary.cancelled} />
        <KpiCard label="Paused" value={summary.paused} />
        <KpiCard label="Pending" value={summary.pending} />
      </div>

      <div className="mt-6">
        <SectionCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input placeholder="Search by student or plan…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search subscriptions" />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No subscriptions found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Meals Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.studentName}</TableCell>
                      <TableCell>{s.planName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(s.startDate)} – {formatDate(s.endDate)}</TableCell>
                      <TableCell>{s.usedMeals}/{s.totalMeals}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={s.status} />
                          {s.requestStatus && <StatusBadge status={s.requestStatus} tone="warning" />}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={s.paymentStatus} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setDetail(s)}>Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.studentName}'s Subscription</DialogTitle>
            <DialogDescription>{detail?.id}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Plan:</span> {detail.planName}</p>
              <p><span className="text-muted-foreground">Period:</span> {formatDate(detail.startDate)} – {formatDate(detail.endDate)}</p>
              <p><span className="text-muted-foreground">Meals used:</span> {detail.usedMeals} of {detail.totalMeals}</p>
              <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={detail.status} /></p>
              <p><span className="text-muted-foreground">Payment:</span> <StatusBadge status={detail.paymentStatus} /></p>
              {detail.requestStatus && (
                <p><span className="text-muted-foreground">Request:</span> <StatusBadge status={detail.requestStatus} tone="warning" /></p>
              )}
            </div>
          )}
          {detail?.requestStatus === "Pause Request Pending" && (
            <DialogFooter>
              <Button onClick={() => approveRequest(detail, "pause")}>Approve Pause</Button>
            </DialogFooter>
          )}
          {detail?.requestStatus === "Cancellation Request Pending" && (
            <DialogFooter>
              <Button variant="destructive" onClick={() => approveRequest(detail, "cancel")}>Approve Cancellation</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
