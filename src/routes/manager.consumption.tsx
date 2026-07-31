import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatDate, todayISO } from "@/data/mock";
import { MEAL_TYPES, type MealType } from "@/data/types";
import { wastagePct } from "@/components/fp/manager/analytics-utils";

export const Route = createFileRoute("/manager/consumption")({
  head: () => ({
    meta: [
      { title: "Meal Consumption — FoodPulse Mess Manager" },
      { name: "description", content: "Record prepared and consumed meal counts and track wastage." },
      { property: "og:title", content: "Meal Consumption — FoodPulse Mess Manager" },
      { property: "og:description", content: "Enter daily meal consumption data." },
    ],
  }),
  component: ConsumptionEntry,
});

function ConsumptionEntry() {
  const { consumption, saveConsumption, logAction, currentUser } = useApp();
  const [date, setDate] = useState(todayISO());
  const [meal, setMeal] = useState<MealType>("Breakfast");
  const existing = consumption.find((c) => c.date === date && c.meal === meal);
  const [prepared, setPrepared] = useState(String(existing?.prepared ?? ""));
  const [consumed, setConsumed] = useState(String(existing?.consumed ?? ""));

  const expected = existing?.expected ?? 0;

  const preparedNum = Number(prepared) || 0;
  const consumedNum = Number(consumed) || 0;
  const wasted = Math.max(0, preparedNum - consumedNum);
  const pct = wastagePct(preparedNum, consumedNum);

  const preparedError = prepared !== "" && preparedNum < 0 ? "Prepared cannot be negative" : "";
  const consumedError =
    consumed !== "" && consumedNum < 0
      ? "Consumed cannot be negative"
      : consumed !== "" && preparedNum > 0 && consumedNum > preparedNum
        ? "Consumed cannot exceed prepared"
        : "";

  const switchTo = (d: string, m: MealType) => {
    setDate(d);
    setMeal(m);
    const rec = consumption.find((c) => c.date === d && c.meal === m);
    setPrepared(String(rec?.prepared ?? ""));
    setConsumed(String(rec?.consumed ?? ""));
  };

  const handleSave = () => {
    if (preparedError || consumedError || prepared === "" || consumed === "") {
      toast.error("Please fix the highlighted errors before saving");
      return;
    }
    saveConsumption({
      date,
      meal,
      expected: expected || preparedNum,
      prepared: preparedNum,
      consumed: consumedNum,
    });
    logAction({
      user: `${currentUser?.name ?? "Manager"} (Manager)`,
      action: "Recorded consumption",
      module: "Meal Consumption",
      description: `${meal} ${formatDate(date)}: prepared ${preparedNum}, consumed ${consumedNum}`,
      status: "Success",
    });
    toast.success("Consumption data saved");
  };

  const recent = useMemo(
    () => [...consumption].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12),
    [consumption],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal Consumption Entry"
        description="Record prepared and consumed quantities for each meal."
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Meal Consumption" }]}
      />

      <SectionCard title="Enter Consumption Data" padded>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="cons-date">Date</Label>
            <Input id="cons-date" type="date" value={date} onChange={(e) => switchTo(e.target.value, meal)} />
          </div>
          <div>
            <Label htmlFor="cons-meal">Meal</Label>
            <Select value={meal} onValueChange={(v) => switchTo(date, v as MealType)}>
              <SelectTrigger id="cons-meal"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((mt) => (
                  <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expected</Label>
            <Input value={expected || "—"} disabled />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="cons-prepared">Prepared</Label>
            <Input
              id="cons-prepared"
              type="number"
              min={0}
              value={prepared}
              onChange={(e) => setPrepared(e.target.value)}
              aria-invalid={!!preparedError}
            />
            {preparedError && <p className="mt-1 text-xs text-destructive">{preparedError}</p>}
          </div>
          <div>
            <Label htmlFor="cons-consumed">Consumed</Label>
            <Input
              id="cons-consumed"
              type="number"
              min={0}
              value={consumed}
              onChange={(e) => setConsumed(e.target.value)}
              aria-invalid={!!consumedError}
            />
            {consumedError && <p className="mt-1 text-xs text-destructive">{consumedError}</p>}
          </div>
          <div>
            <Label>Wasted (auto)</Label>
            <Input value={wasted} disabled />
          </div>
          <div>
            <Label>Wastage % (auto)</Label>
            <Input value={`${pct.toFixed(1)}%`} disabled />
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={handleSave}>Save Consumption</Button>
        </div>
      </SectionCard>

      <SectionCard title="Recent Entries" padded={false}>
        {recent.length === 0 ? (
          <EmptyState title="No consumption records yet" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Prepared</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Wasted</TableHead>
                  <TableHead>Wastage %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.date)}</TableCell>
                    <TableCell>{c.meal}</TableCell>
                    <TableCell>{c.expected}</TableCell>
                    <TableCell>{c.prepared}</TableCell>
                    <TableCell>{c.consumed}</TableCell>
                    <TableCell>{c.prepared - c.consumed}</TableCell>
                    <TableCell>{wastagePct(c.prepared, c.consumed).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
