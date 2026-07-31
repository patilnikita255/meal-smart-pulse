import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="FoodPulse home">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M2 13h4l2-5 3 9 2.5-6 1.7 2h6.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block font-display text-lg leading-none font-semibold tracking-tight">
            FoodPulse
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">Smart Mess Management</span>
        </span>
      )}
    </Link>
  );
}
