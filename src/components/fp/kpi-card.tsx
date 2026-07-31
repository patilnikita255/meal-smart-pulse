import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  className?: string;
}) {
  return (
    <div className={cn("fp-surface p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl leading-tight font-semibold sm:text-3xl">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {hint}
        {trend && (
          <span className={cn("font-semibold", trend.positive ? "text-success" : "text-destructive")}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
