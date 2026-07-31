import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Utensils } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { formatMoney } from "@/data/mock";
import type { Plan } from "@/data/types";

export const Route = createFileRoute("/student/plans")({
  head: () => ({
    meta: [
      { title: "Available Plans — FoodPulse Student Portal" },
      { name: "description", content: "Compare and subscribe to mess meal plans." },
      { property: "og:title", content: "Available Plans — FoodPulse Student Portal" },
      { property: "og:description", content: "Weekly and monthly meal plans for FoodPulse students." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { plans, currentSubscription, subscribeToPlan } = useApp();
  const [target, setTarget] = useState<Plan | null>(null);
  const activePlans = plans.filter((p) => p.status === "Active");

  const confirmSubscribe = () => {
    if (!target) return;
    subscribeToPlan(target.id);
    toast.success(`Subscribed to ${target.name}`);
    setTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Plans"
        description="Choose a plan that fits your schedule and appetite."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Plans" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activePlans.map((plan) => {
          const isCurrent = currentSubscription?.planId === plan.id && currentSubscription.status === "Active";
          return (
            <div key={plan.id} className="fp-surface flex flex-col p-5">
              {isCurrent && (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <CheckCircle2 className="size-3.5" /> Current Plan
                </span>
              )}
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-4 font-display text-3xl font-semibold">
                {formatMoney(plan.price)}
                <span className="text-sm font-normal text-muted-foreground"> / {plan.durationDays} days</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Utensils className="size-4" /> {plan.meals} meals included
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.includes.map((m) => (
                  <StatusBadge key={m} status={m} tone="info" />
                ))}
              </div>
              <Button className="mt-5 w-full" disabled={isCurrent} onClick={() => setTarget(plan)}>
                {isCurrent ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          );
        })}
      </div>

      <SectionCard title="Compare Plans" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-2 font-semibold">Plan</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Price</th>
                <th className="px-4 py-2 font-semibold">Duration</th>
                <th className="px-4 py-2 font-semibold">Meals</th>
                <th className="px-4 py-2 font-semibold">Includes</th>
              </tr>
            </thead>
            <tbody>
              {activePlans.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3">{p.durationDays} days</td>
                  <td className="px-4 py-3">{p.meals}</td>
                  <td className="px-4 py-3">{p.includes.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Confirm subscription"
        description={target ? `Subscribe to ${target.name} for ${formatMoney(target.price)} covering ${target.meals} meals over ${target.durationDays} days? This is a demo — no real payment will be charged.` : ""}
        confirmLabel="Subscribe"
        onConfirm={confirmSubscribe}
      />
    </div>
  );
}
