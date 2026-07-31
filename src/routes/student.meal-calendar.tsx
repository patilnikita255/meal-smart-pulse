import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, addDays, BASE_DATE, formatDate, iso, weekdayName } from "@/data/mock";
import { MEAL_TYPES, type MealType } from "@/data/types";

export const Route = createFileRoute("/student/meal-calendar")({
  head: () => ({
    meta: [
      { title: "Meal Calendar — FoodPulse Student Portal" },
      { name: "description", content: "Select or skip your upcoming meals before the daily cutoff time." },
      { property: "og:title", content: "Meal Calendar — FoodPulse Student Portal" },
      { property: "og:description", content: "Manage your daily meal selections before the 10 PM cutoff." },
    ],
  }),
  component: MealCalendarPage,
});

const LOCK_MSG = "Meal selection deadline has passed. This meal can no longer be changed.";

function MealCalendarPage() {
  const { meals, setMealSelection, isLocked, currentSubscription } = useApp();
  const [skipTarget, setSkipTarget] = useState<{ date: string; meal: MealType } | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => iso(addDays(BASE_DATE, i - 3))), []);
  const myMeals = meals.filter((m) => m.studentId === CURRENT_STUDENT_ID);
  const subscriptionActive = currentSubscription?.status === "Active";

  const handleToggle = (date: string, meal: MealType, current: "Selected" | "Skipped") => {
    if (!subscriptionActive) return;
    if (isLocked(date)) {
      setLockedNotice(LOCK_MSG);
      toast.error(LOCK_MSG);
      return;
    }
    if (current === "Selected") {
      setSkipTarget({ date, meal });
    } else {
      setMealSelection(date, meal, "Selected");
      toast.success(`${meal} on ${formatDate(date)} selected`);
    }
  };

  const confirmSkip = () => {
    if (!skipTarget) return;
    setMealSelection(skipTarget.date, skipTarget.meal, "Skipped");
    toast.success(`${skipTarget.meal} on ${formatDate(skipTarget.date)} skipped`);
    setSkipTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal Calendar"
        description="Toggle your meal selections up to the daily cutoff."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Meal Calendar" }]}
      />

      <div className="fp-surface flex items-start gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-info/12 text-info">
          <Info className="size-4" />
        </span>
        <div className="text-sm">
          <p className="font-semibold">Cutoff rule</p>
          <p className="text-muted-foreground">
            Meal selections must be confirmed by <strong>10:00 PM the previous day</strong>. After the cutoff, the
            meal is locked and cannot be changed.
          </p>
        </div>
      </div>

      {!subscriptionActive && (
        <div className="fp-surface flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Subscription not active</p>
            <p className="text-muted-foreground">
              Your subscription status is "{currentSubscription?.status ?? "None"}". You cannot change meal
              selections until you renew or subscribe to a plan.
            </p>
          </div>
        </div>
      )}

      {lockedNotice && (
        <div className="fp-surface flex items-center gap-3 border border-warning/30 bg-warning/10 p-3 text-sm">
          <Lock className="size-4 shrink-0 text-warning" />
          <p>{lockedNotice}</p>
        </div>
      )}

      <SectionCard title="Your 14-day meal schedule" padded={false}>
        {dates.length === 0 ? (
          <EmptyState title="No schedule available" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-2 font-semibold">Date</th>
                  {MEAL_TYPES.map((mt) => (
                    <th key={mt} className="px-4 py-2 font-semibold">
                      {mt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => {
                  const locked = isLocked(date);
                  return (
                    <tr key={date} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{weekdayName(date)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                      </td>
                      {MEAL_TYPES.map((mt) => {
                        const rec = myMeals.find((m) => m.date === date && m.meal === mt);
                        const status = locked ? "Locked" : rec?.selection ?? "Selected";
                        return (
                          <td key={mt} className="px-4 py-3">
                            <button
                              type="button"
                              disabled={!subscriptionActive}
                              onClick={() => rec && handleToggle(date, mt, rec.selection)}
                              className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <StatusBadge status={status} icon={locked ? <Lock className="size-3" /> : undefined} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!skipTarget}
        onOpenChange={(o) => !o && setSkipTarget(null)}
        title="Skip this meal?"
        description={
          skipTarget ? `Are you sure you want to skip ${skipTarget.meal} on ${formatDate(skipTarget.date)}? You can undo this before the cutoff.` : ""
        }
        confirmLabel="Skip meal"
        destructive
        onConfirm={confirmSkip}
      />

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setLockedNotice(null)} className={lockedNotice ? "" : "hidden"}>
          Dismiss notice
        </Button>
      </div>
    </div>
  );
}
