import type { ConsumptionRecord, MealType } from "@/data/types";
import { addDays, BASE_DATE, iso, todayISO, weekdayName } from "@/data/mock";
import { MEAL_TYPES } from "@/data/types";

export function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => iso(addDays(BASE_DATE, -6 + i)));
}

export function rangeDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => iso(addDays(BASE_DATE, -(n - 1) + i)));
}

export function consumptionFor(consumption: ConsumptionRecord[], date: string, meal?: MealType) {
  return consumption.filter((c) => c.date === date && (meal ? c.meal === meal : true));
}

export function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

export function wastagePct(prepared: number, consumed: number) {
  if (prepared <= 0) return 0;
  return Math.max(0, ((prepared - consumed) / prepared) * 100);
}

export function isWeekend(date: string) {
  const dow = new Date(date + "T00:00:00").getDay();
  return dow === 0 || dow === 6;
}

/** 7-day rolling average consumption per meal ending "today", used to predict tomorrow's demand. */
export function rollingAverageByMeal(consumption: ConsumptionRecord[], meal: MealType, days = 7) {
  const dates = rangeDays(days);
  const records = dates.map((d) => consumption.find((c) => c.date === d && c.meal === meal)).filter(Boolean) as ConsumptionRecord[];
  if (records.length === 0) return 0;
  return Math.round(sum(records.map((r) => r.consumed)) / records.length);
}

export function weekdayAverage(consumption: ConsumptionRecord[]) {
  // avg total consumed per weekday name over available history
  const byDay: Record<string, number[]> = {};
  consumption.forEach((c) => {
    const name = weekdayName(c.date);
    byDay[name] = byDay[name] ?? [];
  });
  const totalsByDate: Record<string, number> = {};
  consumption.forEach((c) => {
    totalsByDate[c.date] = (totalsByDate[c.date] ?? 0) + c.consumed;
  });
  Object.entries(totalsByDate).forEach(([date, total]) => {
    const name = weekdayName(date);
    byDay[name] = byDay[name] ?? [];
    byDay[name]!.push(total);
  });
  return Object.entries(byDay).map(([day, vals]) => ({
    day,
    avg: vals.length ? Math.round(sum(vals) / vals.length) : 0,
  }));
}

export function weekdayVsWeekend(consumption: ConsumptionRecord[], meal: MealType) {
  const weekday: number[] = [];
  const weekend: number[] = [];
  consumption
    .filter((c) => c.meal === meal)
    .forEach((c) => {
      (isWeekend(c.date) ? weekend : weekday).push(c.consumed);
    });
  const avgWeekday = weekday.length ? sum(weekday) / weekday.length : 0;
  const avgWeekend = weekend.length ? sum(weekend) / weekend.length : 0;
  const deviation = avgWeekday > 0 ? ((avgWeekend - avgWeekday) / avgWeekday) * 100 : 0;
  return { avgWeekday: Math.round(avgWeekday), avgWeekend: Math.round(avgWeekend), deviation };
}

export { MEAL_TYPES, todayISO };
