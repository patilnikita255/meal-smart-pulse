import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { KpiCard } from "@/components/fp/kpi-card";
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
import { exportCsv } from "@/lib/export";
import type { Payment } from "@/data/types";

export const Route = createFileRoute("/manager/payments")({
  head: () => ({
    meta: [
      { title: "Payments — FoodPulse Mess Manager" },
      { name: "description", content: "Track paid and unpaid invoices, mark payment status and view bills." },
      { property: "og:title", content: "Payments — FoodPulse Mess Manager" },
      { property: "og:description", content: "Manage subscriber payment records." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { payments, setPaymentStatus, logAction, currentUser } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Paid" | "Unpaid">("All");
  const [bill, setBill] = useState<Payment | null>(null);
  const [confirmPay, setConfirmPay] = useState<{ id: string; next: "Paid" | "Unpaid" } | null>(null);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch = search.trim() ? p.studentName.toLowerCase().includes(search.toLowerCase()) || p.invoice.toLowerCase().includes(search.toLowerCase()) : true;
      const matchesStatus = status === "All" ? true : p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, status]);

  const totalPayments = payments.length;
  const paidCount = payments.filter((p) => p.status === "Paid").length;
  const unpaidCount = payments.filter((p) => p.status === "Unpaid").length;
  const pendingAmount = payments.filter((p) => p.status === "Unpaid").reduce((a, p) => a + p.amount, 0);

  const applyStatus = () => {
    if (!confirmPay) return;
    setPaymentStatus(confirmPay.id, confirmPay.next);
    logAction({
      user: `${currentUser?.name ?? "Manager"} (Manager)`,
      action: "Changed payment status",
      module: "Payments",
      description: `Invoice ${confirmPay.id} marked ${confirmPay.next}`,
      status: "Success",
    });
    toast.success(`Payment marked ${confirmPay.next}`);
    setConfirmPay(null);
  };

  const handleExport = () => {
    exportCsv(
      "payments",
      filtered.map((p) => ({
        Invoice: p.invoice,
        Student: p.studentName,
        Plan: p.planName,
        Amount: p.amount,
        Date: p.date,
        Status: p.status,
      })),
    );
    toast.success("Payments exported to CSV");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track subscriber payments and outstanding invoices."
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Payments" }]}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 size-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Payments" value={totalPayments} />
        <KpiCard label="Paid" value={paidCount} />
        <KpiCard label="Unpaid" value={unpaidCount} />
        <KpiCard label="Pending Amount" value={formatMoney(pendingAmount)} />
      </div>

      <SectionCard
        title="Payment Records"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Search student or invoice…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 pl-8" aria-label="Search payments" />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-32" aria-label="Filter status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        padded={false}
      >
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No payments found" description="Try adjusting your search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.studentName}</TableCell>
                    <TableCell>{p.planName}</TableCell>
                    <TableCell>{formatMoney(p.amount)}</TableCell>
                    <TableCell>{formatDate(p.date)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setBill(p)}>View Bill</Button>
                        <Button
                          size="sm"
                          onClick={() => setConfirmPay({ id: p.id, next: p.status === "Paid" ? "Unpaid" : "Paid" })}
                        >
                          Mark {p.status === "Paid" ? "Unpaid" : "Paid"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Dialog open={!!bill} onOpenChange={(o) => !o && setBill(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invoice {bill?.invoice}</DialogTitle></DialogHeader>
          {bill && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span>{bill.studentName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{bill.planName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Base Amount</span><span>{formatMoney(bill.baseAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Adjustment</span><span>{formatMoney(bill.adjustment)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>{formatMoney(bill.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(bill.date)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={bill.status} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBill(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmPay}
        onOpenChange={(o) => !o && setConfirmPay(null)}
        title={`Mark payment as ${confirmPay?.next}?`}
        description="This updates the invoice status for the subscriber."
        confirmLabel="Confirm"
        onConfirm={applyStatus}
      />
    </div>
  );
}
