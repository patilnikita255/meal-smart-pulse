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
import { formatDate, formatMoney } from "@/data/mock";
import { exportCsv } from "@/lib/export";
import type { Payment } from "@/data/types";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments | FoodPulse Admin" },
      { name: "description", content: "Track and manage payment status across all invoices." },
      { property: "og:title", content: "Payments | FoodPulse Admin" },
      { property: "og:description", content: "Track and manage payment status across all invoices." },
    ],
  }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const { payments, setPaymentStatus, logAction } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Paid" | "Unpaid">("all");
  const [detail, setDetail] = useState<Payment | null>(null);

  const summary = useMemo(() => {
    const total = payments.reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
    const unpaidCount = payments.filter((p) => p.status === "Unpaid").length;
    const unpaidAmount = payments.filter((p) => p.status === "Unpaid").reduce((s, p) => s + p.amount, 0);
    return { total, paid, unpaidCount, unpaidAmount };
  }, [payments]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !search || p.studentName.toLowerCase().includes(search.toLowerCase()) || p.invoice.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  function markStatus(p: Payment, status: "Paid" | "Unpaid") {
    setPaymentStatus(p.id, status);
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: "Changed payment status",
      module: "Payments",
      description: `Invoice ${p.invoice} marked ${p.status} → ${status}`,
      status: "Success",
    });
    toast.success(`Invoice ${p.invoice} marked ${status}`);
    setDetail(null);
  }

  function handleExport() {
    exportCsv("admin-payments", filtered.map((p) => ({
      Invoice: p.invoice,
      Student: p.studentName,
      Plan: p.planName,
      Amount: p.amount,
      Date: p.date,
      Status: p.status,
    })));
    toast.success("Payments exported to CSV");
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Manage payment status across all student invoices."
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 size-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Collected" value={formatMoney(summary.paid)} />
        <KpiCard label="Total Billed" value={formatMoney(summary.total)} />
        <KpiCard label="Unpaid Invoices" value={summary.unpaidCount} />
        <KpiCard label="Unpaid Amount" value={formatMoney(summary.unpaidAmount)} />
      </div>

      <div className="mt-6">
        <SectionCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input placeholder="Search by invoice or student…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search payments" />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No payments found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.invoice}</TableCell>
                      <TableCell>{p.studentName}</TableCell>
                      <TableCell>{p.planName}</TableCell>
                      <TableCell>{formatMoney(p.amount)}</TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setDetail(p)}>View</Button>
                          {p.status === "Unpaid" ? (
                            <Button size="sm" onClick={() => markStatus(p, "Paid")}>Mark Paid</Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => markStatus(p, "Unpaid")}>Mark Unpaid</Button>
                          )}
                        </div>
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
            <DialogTitle>Invoice {detail?.invoice}</DialogTitle>
            <DialogDescription>Payment details for {detail?.studentName}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Plan:</span> {detail.planName}</p>
              <p><span className="text-muted-foreground">Base amount:</span> {formatMoney(detail.baseAmount)}</p>
              <p><span className="text-muted-foreground">Adjustment:</span> {formatMoney(detail.adjustment)}</p>
              <p><span className="text-muted-foreground">Total:</span> {formatMoney(detail.amount)}</p>
              <p><span className="text-muted-foreground">Date:</span> {formatDate(detail.date)}</p>
              <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={detail.status} /></p>
            </div>
          )}
          <DialogFooter>
            {detail?.status === "Unpaid" ? (
              <Button onClick={() => detail && markStatus(detail, "Paid")}>Mark Paid</Button>
            ) : (
              <Button variant="outline" onClick={() => detail && markStatus(detail, "Unpaid")}>Mark Unpaid</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
