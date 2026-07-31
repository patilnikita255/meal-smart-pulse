import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, formatDate, formatMoney } from "@/data/mock";
import { exportCsv, printReport } from "@/lib/export";
import type { Payment } from "@/data/types";

export const Route = createFileRoute("/student/payments")({
  head: () => ({
    meta: [
      { title: "Payment History — FoodPulse Student Portal" },
      { name: "description", content: "Review your invoice and payment history." },
      { property: "og:title", content: "Payment History — FoodPulse Student Portal" },
      { property: "og:description", content: "Export and view your FoodPulse payment history." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { payments } = useApp();
  const [selected, setSelected] = useState<Payment | null>(null);

  const myPayments = useMemo(
    () => payments.filter((p) => p.studentId === CURRENT_STUDENT_ID).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [payments],
  );

  const handleExport = () => {
    exportCsv(
      "foodpulse-payment-history",
      myPayments.map((p) => ({
        Invoice: p.invoice,
        Date: p.date,
        Plan: p.planName,
        Amount: p.amount,
        Status: p.status,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="All invoices raised for your subscriptions."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Payment History" }]}
        actions={<Button variant="outline" onClick={handleExport} disabled={myPayments.length === 0}>Export CSV</Button>}
      />

      <SectionCard padded={false}>
        {myPayments.length === 0 ? (
          <EmptyState title="No payment history" description="Your invoices will appear here once billed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-2 font-semibold">Invoice</th>
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 font-semibold">Plan</th>
                  <th className="px-4 py-2 font-semibold">Amount</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Bill</th>
                </tr>
              </thead>
              <tbody>
                {myPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{p.invoice}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(p.date)}</td>
                    <td className="px-4 py-3">{p.planName}</td>
                    <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setSelected(p)}>View Bill</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice {selected?.invoice}</DialogTitle>
            <DialogDescription>{selected && formatDate(selected.date)}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{selected.planName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Base Amount</span><span>{formatMoney(selected.baseAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Adjustment</span><span>{selected.adjustment === 0 ? "—" : formatMoney(selected.adjustment)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>{formatMoney(selected.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={selected.status} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="gap-2" onClick={() => printReport()}>
              <Printer className="size-4" /> Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
