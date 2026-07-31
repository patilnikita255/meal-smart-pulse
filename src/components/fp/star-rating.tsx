import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "md",
  label,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const dim = size === "sm" ? "size-3.5" : "size-5";
  return (
    <div className="flex items-center gap-1" role={onChange ? "radiogroup" : undefined} aria-label={label ?? "Rating"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n;
        const content = (
          <Star className={cn(dim, filled ? "fill-warning text-warning" : "text-muted-foreground/50")} />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {content}
          </button>
        ) : (
          <span key={n}>{content}</span>
        );
      })}
      <span className="ml-1 text-xs text-muted-foreground">{value ? `${value}/5` : "Not rated"}</span>
    </div>
  );
}
