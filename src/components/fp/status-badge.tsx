import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/18 text-accent-foreground border-warning/35",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-soft text-primary border-primary/25",
};

const MAP: Record<string, Tone> = {
  Active: "success",
  Selected: "success",
  Paid: "success",
  Attended: "success",
  RESOLVED: "success",
  Resolved: "success",
  Success: "success",
  Approved: "success",
  Skipped: "warning",
  Pending: "warning",
  Paused: "warning",
  "IN PROGRESS": "warning",
  Upcoming: "info",
  OPEN: "info",
  Locked: "neutral",
  Inactive: "neutral",
  Expired: "neutral",
  Cancelled: "danger",
  Unpaid: "danger",
  Missed: "danger",
  Failed: "danger",
};

export function StatusBadge({
  status,
  tone,
  icon,
  className,
}: {
  status: string;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  const resolved = tone ?? MAP[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        toneClass[resolved],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      {icon}
      {status}
    </span>
  );
}
