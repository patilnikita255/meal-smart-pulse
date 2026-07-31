import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { EmptyState, TableSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatDate, formatMoney } from "@/data/mock";
import type { Subscription, SubscriptionStatus } from "@/data/types";

export const Route = createFileRoute("/manager/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — FoodPulse Mess Manager" },
      { name: "description", content: "Search, filter and manage student subscribers, cancellations and pause requests." },
      { property: "og:title", content: "Subscribers — FoodPulse Mess Manager" },
      { property: "og:description", content: "Manage subscriber status, cancellation and pause approvals." },
    ],
  }),
  component: Subscribers,
});

const STATUS_FILTERS: (SubscriptionStatus | "All")[] = ["All", "Active", "Expired", "Pending", "Cancelled", "Paused"];

function Subscribers() {
  const { subscriptions, meals, payments, updateSubscription, logAction, currentUser } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "pause" | null>(null);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch = search.trim()
        ? s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentEmail.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesStatus = status === "All" ? true : s.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, status]);

  const studentMeals = (studentId: string) => meals.filter((m) => m.studentId === studentId);
  const studentPayments = (studentId: string) => payments.filter((p) => p.studentId === studentId);

  const approve = (kind: "cancel" | "pause") => {
    if (!selected) return;
    updateSubscription(selected.id, {
      status: kind === "cancel" ? "Cancelled" : "Paused",
      requestStatus: null,
    });
    logAction({
      user: `${currentUser?.name ?? "Manager"} (Manager)`,
      action: kind === "cancel" ? "Approved cancellation" : "Approved pause",
      module: "Subscriptions",
      description: `${selected.id} ${kind} approved for ${selected.studentName}`,
      status: "Success",
    });
    toast.success(`${kind === "cancel" ? "Cancellation" : "Pause"} approved for ${selected.studentName}`);
    setConfirmAction(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        description="View and manage student subscriptions."
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Subscribers" }]}
      />

      <SectionCard
        title="All Subscribers"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 pl-8" aria-label="Search subscribers" />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-40" aria-label="Filter status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        padded={false}
      >
        {loading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No subscribers found" description="Try adjusting your search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meals Used</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.studentEmail}</TableCell>
                    <TableCell>{s.planName}</TableCell>
                    <TableCell>{formatDate(s.startDate)}</TableCell>
                    <TableCell>{formatDate(s.endDate)}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell>{s.usedMeals} / {s.totalMeals}</TableCell>
                    <TableCell><StatusBadge status={s.paymentStatus} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(s)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.studentName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-semibold">Subscription</p>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>Plan: <span className="text-foreground">{selected.planName}</span></span>
                  <span>Status: <StatusBadge status={selected.status} /></span>
                  <span>Start: {formatDate(selected.startDate)}</span>
                  <span>End: {formatDate(selected.endDate)}</span>
                  <span>Meals: {selected.usedMeals} / {selected.totalMeals}</span>
                  <span>Payment: <StatusBadge status={selected.paymentStatus} /></span>
                </div>
              </div>
              <div>
                <p className="mb-1 font-semibold">Meal History Summary</p>
                <p className="text-muted-foreground">
                  {studentMeals(selected.studentId).filter((m) => m.attendance === "Attended").length} attended,{" "}
                  {studentMeals(selected.studentId).filter((m) => m.attendance === "Missed").length} missed of{" "}
                  {studentMeals(selected.studentId).length} recorded meals.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">Payments</p>
                <ul className="space-y-1 text-muted-foreground">
                  {studentPayments(selected.studentId).slice(0, 4).map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span>{p.invoice} · {formatDate(p.date)}</span>
                      <span>{formatMoney(p.amount)} — <StatusBadge status={p.status} className="ml-1" /></span>
                    </li>
                  ))}
                  {studentPayments(selected.studentId).length === 0 && <li>No payments recorded.</li>}
                </ul>
              </div>
              {selected.requestStatus && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                  <p className="mb-2 font-semibold">{selected.requestStatus}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setConfirmAction(selected.requestStatus?.startsWith("Cancellation") ? "cancel" : "pause")}>
                      Approve {selected.requestStatus.startsWith("Cancellation") ? "Cancellation" : "Pause"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title={confirmAction === "cancel" ? "Approve cancellation?" : "Approve pause?"}
        description={`This will mark ${selected?.studentName}'s subscription as ${confirmAction === "cancel" ? "Cancelled" : "Paused"}.`}
        confirmLabel="Approve"
        onConfirm={() => confirmAction && approve(confirmAction)}
      />
    </div>
  );
}
