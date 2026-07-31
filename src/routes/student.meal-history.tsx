import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { StarRating } from "@/components/fp/star-rating";
import { EmptyState, TableSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, formatDate } from "@/data/mock";
import { MEAL_TYPES, type MealRecord } from "@/data/types";

export const Route = createFileRoute("/student/meal-history")({
  head: () => ({
    meta: [
      { title: "Meal History — FoodPulse Student Portal" },
      { name: "description", content: "Review your past meal selections, attendance and ratings." },
      { property: "og:title", content: "Meal History — FoodPulse Student Portal" },
      { property: "og:description", content: "Filter and review your meal history with FoodPulse." },
    ],
  }),
  component: MealHistoryPage,
});

function MealHistoryPage() {
  const { meals, rateMeal } = useApp();
  const loading = useSimulatedLoad();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mealType, setMealType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<MealRecord | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const myMeals = useMemo(
    () => meals.filter((m) => m.studentId === CURRENT_STUDENT_ID).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [meals],
  );

  const filtered = myMeals.filter((m) => {
    if (from && m.date < from) return false;
    if (to && m.date > to) return false;
    if (mealType !== "all" && m.meal !== mealType) return false;
    if (status !== "all" && m.attendance !== status) return false;
    return true;
  });

  const openDetails = (m: MealRecord) => {
    setSelected(m);
    setRating(m.rating);
    setFeedbackText(m.feedback ?? "");
  };

  const saveRating = () => {
    if (!selected || rating === null) return;
    rateMeal(selected.id, rating, feedbackText || undefined);
    toast.success("Thanks! Your rating was saved.");
    setSelected(null);
  };

  const hasFilters = from || to || mealType !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal History"
        description="Track your past meal selections and rate the meals you attended."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Meal History" }]}
      />

      <SectionCard title="Filters">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All meals</SelectItem>
                {MEAL_TYPES.map((mt) => <SelectItem key={mt} value={mt}>{mt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Attended">Attended</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Meal Records" description={`${filtered.length} records`} padded={false}>
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : myMeals.length === 0 ? (
          <EmptyState title="No meal history yet" description="Your meal history will appear here once you have subscribed." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching records"
            description={hasFilters ? "Try adjusting your filters to see more results." : "No records found."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 font-semibold">Meal</th>
                  <th className="px-4 py-2 font-semibold">Menu</th>
                  <th className="px-4 py-2 font-semibold">Selection</th>
                  <th className="px-4 py-2 font-semibold">Attendance</th>
                  <th className="px-4 py-2 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => openDetails(m)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(m.date)}</td>
                    <td className="px-4 py-3">{m.meal}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{m.menu}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.selection} /></td>
                    <td className="px-4 py-3"><StatusBadge status={m.attendance} /></td>
                    <td className="px-4 py-3"><StarRating value={m.rating} size="sm" /></td>
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
            <DialogTitle>Meal Details</DialogTitle>
            <DialogDescription>{selected && `${formatDate(selected.date)} · ${selected.meal}`}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Menu</p>
                <p>{selected.menu}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Selection</p>
                  <StatusBadge status={selected.selection} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Attendance</p>
                  <StatusBadge status={selected.attendance} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Your Rating</Label>
                <StarRating value={rating} onChange={setRating} label="Rate this meal" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us about the taste, quantity or service…"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={saveRating} disabled={rating === null}>Save Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
