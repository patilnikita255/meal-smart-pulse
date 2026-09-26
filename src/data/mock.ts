/**
 * Date/format helpers shared by the UI. Business data lives in the database —
 * nothing in this file is mock data any more.
 */

/** Today's date in India (Asia/Kolkata), as a local-midnight Date. */
function istToday(): Date {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(s + "T00:00:00");
}

export const BASE_DATE = istToday();

export function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
export function todayISO() {
  return iso(istToday());
}
export function formatDate(dateStr: string) {
  const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatMoney(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
export function weekdayName(dateStr: string) {
  return new Date(dateStr.slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long" });
}

/** Signed-in student's id (live binding, set by the app store after sign-in). */
export let CURRENT_STUDENT_ID = "";
export function setCurrentStudentId(id: string) {
  CURRENT_STUDENT_ID = id;
}

/** Cutoff check mirrored from the backend: 10:00 PM IST on the previous day. */
export function isPastCutoff(date: string, cutoff = "22:00") {
  const d = addDays(new Date(date + "T00:00:00"), -1);
  const at = new Date(`${iso(d)}T${cutoff.slice(0, 5)}:00+05:30`);
  return Date.now() >= at.getTime();
}
