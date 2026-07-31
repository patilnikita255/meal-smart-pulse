import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatDate } from "@/data/mock";

export const Route = createFileRoute("/student/subscription")({
  head: () => ({
    meta: [
      { title: "My Subscription — FoodPulse Student Portal" },
      { name: "description", content: "View and manage your current mess subscription." },
      { property: "og:title", content: "My Subscription — FoodPulse Student Portal" },
      { property: "og:description", content: "Renew, pause or cancel your FoodPulse subscription." },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { currentSubscription, renewSubscription, requestSubscriptionChange } = useApp();
  const [action, setAction] = useState<"pause" | "cancel" | "renew" | null>(null);

  if (!currentSubscription) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Subscription" breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Subscription" }]} />
        <SectionCard>
          <EmptyState
            title="No subscription found"
            description="Subscribe to a plan to start managing your meals."
            action={<Link to="/student/plans" className="text-sm font-medium text-primary hover:underline">Browse plans</Link>}
          />
        </SectionCard>
      </div>
    );
  }

  const sub = currentSubscription;
  const remaining = sub.totalMeals - sub.usedMeals;
  const progress = (sub.usedMeals / sub.totalMeals) * 100;

  const confirm = () => {
    if (action === "renew") {
      renewSubscription();
      toast.success("Subscription renewed");
    } else if (action === "pause") {
      requestSubscriptionChange("pause");
      toast.success("Pause request submitted");
    } else if (action === "cancel") {
      requestSubscriptionChange("cancel");
      toast.success("Cancellation request submitted");
    }
    setAction(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subscription"
        description="Manage your active meal plan."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Subscription" }]}
      />

      {sub.requestStatus && (
        <div className="fp-surface flex items-center gap-3 border border-warning/30 bg-warning/10 p-4 text-sm">
          <StatusBadge status="Pending" tone="warning" />
          <p>{sub.requestStatus} — our team will process this shortly.</p>
        </div>
      )}

      <SectionCard title={sub.planName} actions={<StatusBadge status={sub.status} />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Start Date</p>
            <p className="font-medium">{formatDate(sub.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">End Date</p>
            <p className="font-medium">{formatDate(sub.endDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Meals</p>
            <p className="font-medium">{sub.totalMeals}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Remaining Meals</p>
            <p className="font-medium">{remaining}</p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Meals used</span>
            <span className="font-semibold">{sub.usedMeals} / {sub.totalMeals}</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => setAction("renew")}>Renew Subscription</Button>
          <Button variant="outline" disabled={!!sub.requestStatus || sub.status !== "Active"} onClick={() => setAction("pause")}>
            Request Pause
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={!!sub.requestStatus || sub.status !== "Active"}
            onClick={() => setAction("cancel")}
          >
            Request Cancellation
          </Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={action === "renew" ? "Renew subscription?" : action === "pause" ? "Request a pause?" : "Request cancellation?"}
        description={
          action === "renew"
            ? "This will renew your current plan for another cycle and reset used meals to zero."
            : action === "pause"
            ? "A pause request will be sent to the mess manager for approval."
            : "A cancellation request will be sent to the mess manager for approval."
        }
        confirmLabel={action === "renew" ? "Renew" : "Submit Request"}
        destructive={action === "cancel"}
        onConfirm={confirm}
      />
    </div>
  );
}
