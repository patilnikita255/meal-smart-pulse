import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className={cn("mx-auto w-full max-w-6xl px-4", containerClassName)}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center,
  as = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
      )}
      <Heading className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </Heading>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  );
}
