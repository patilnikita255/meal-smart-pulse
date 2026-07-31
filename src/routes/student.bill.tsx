import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, formatDate, formatMoney } from "@/data/mock";

export const Route = createFileRoute("/student/bill")({
  head: () => ({
    meta: [
      { title: "Current Bill — FoodPulse Student Portal" },
      { name: "description", content: "View your current bill and mark demo payments." },
      { property: "og:title", content: "Current Bill — FoodPulse Student Portal" },
      { property: "og:description", content: "Check payment status and instructions for your mess bill." },
    ],
  }),
  component: BillPage,
});

function BillPage() {
  const { payments, setPaymentStatus } = useApp();
  const [showInstructions, setShowInstructions] = useState(false);

  const bill = useMemo(
    () => payments.filter((p) => p.studentId === CURRENT_STUDENT_ID).sort((a, b) => (a.date < b.date ? 1 : -1))[0],
    [payments],
  );

  const markPaid = () => {
    if (!bill) return;
    setPaymentStatus(bill.id, "Paid");
    toast.success("Marked as paid (demo payment)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Current Bill"
        description="Your latest invoice for the current billing cycle."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Current Bill" }]}
      />

      <div className="fp-surface flex items-start gap-3 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-sm text-muted-foreground">
          FoodPulse is a demo prototype — there is no real payment gateway. Use "Mark as Demo Payment" to simulate
          a successful payment.
        </p>
      </div>

      {!bill ? (
        <SectionCard><EmptyState title="No bill available" description="You do not have a current invoice." /></SectionCard>
      ) : (
        <SectionCard title={`Invoice ${bill.invoice}`} actions={<StatusBadge status={bill.status} />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Plan</p>
              <p className="font-medium">{bill.planName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Base Amount</p>
              <p className="font-medium">{formatMoney(bill.baseAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Adjustment</p>
              <p className={`font-medium ${bill.adjustment < 0 ? "text-success" : ""}`}>
                {bill.adjustment === 0 ? "—" : formatMoney(bill.adjustment)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total</p>
              <p className="font-display text-xl font-semibold">{formatMoney(bill.amount)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Billed on {formatDate(bill.date)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowInstructions(true)}>View Payment Instructions</Button>
            <Button disabled={bill.status === "Paid"} onClick={markPaid}>
              {bill.status === "Paid" ? "Already Paid" : "Mark as Demo Payment"}
            </Button>
          </div>
        </SectionCard>
      )}

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Instructions</DialogTitle>
            <DialogDescription>This is a demo — no real payment will be processed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Visit the mess office counter or scan the campus UPI QR code (demo only).</p>
            <p>2. Pay the total amount shown on your invoice.</p>
            <p>3. Ask the mess manager to confirm your payment, or use "Mark as Demo Payment" here to simulate it.</p>
            <p>4. Your subscription status will update automatically once payment is marked as Paid.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
