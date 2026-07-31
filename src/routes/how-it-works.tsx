import { createFileRoute, Link } from "@tanstack/react-router";
import {
  UserPlus,
  CalendarCheck,
  UtensilsCrossed,
  BarChart3,
  ChefHat,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How FoodPulse Works — Step-by-Step Walkthrough" },
      {
        name: "description",
        content: "A 7-step walkthrough of how students, mess managers and admins use FoodPulse together to reduce food waste.",
      },
      { property: "og:title", content: "How FoodPulse Works" },
      { property: "og:description", content: "From registration to demand-driven cooking — see the full FoodPulse workflow." },
    ],
  }),
  component: HowItWorksPage,
});

type Role = "student" | "manager" | "admin";

const steps: { icon: typeof UserPlus; title: string; desc: string; roles: Role[] }[] = [
  { icon: UserPlus, title: "Student registers", desc: "Creates an account with hostel/mess details.", roles: ["student"] },
  { icon: CalendarCheck, title: "Picks a Weekly or Monthly plan", desc: "Chooses a subscription that matches their stay and budget.", roles: ["student"] },
  { icon: UtensilsCrossed, title: "Selects or skips upcoming meals", desc: "Confirms breakfast, lunch and dinner before the daily cutoff.", roles: ["student"] },
  { icon: BarChart3, title: "Manager sees expected demand", desc: "Dashboard shows the predicted headcount per meal, per day.", roles: ["manager"] },
  { icon: ChefHat, title: "Mess prepares meals", desc: "Kitchen cooks quantities aligned with expected demand, not guesswork.", roles: ["manager"] },
  { icon: ClipboardCheck, title: "Consumption & wastage recorded", desc: "Prepared vs. consumed quantities are logged for every meal.", roles: ["manager", "admin"] },
  { icon: Sparkles, title: "Analytics & recommendations", desc: "Wastage trends and smart suggestions are generated for managers and admins.", roles: ["manager", "admin"] },
];

const roleMeta: Record<Role, { label: string; color: string }> = {
  student: { label: "Student", color: "bg-primary-soft text-primary" },
  manager: { label: "Mess Manager", color: "bg-info/10 text-info" },
  admin: { label: "Admin", color: "bg-warning/10 text-warning" },
};

function HowItWorksPage() {
  return (
    <PublicLayout>
      <Section className="fp-hero-glow border-b border-border pt-16 sm:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="How it works"
          title="From registration to reduced waste, in 7 steps"
          description="FoodPulse connects the daily decisions students make with the planning decisions mess managers and admins need to make."
        />
      </Section>

      <Section>
        <ol className="mt-2 space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="fp-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 sm:w-72 sm:shrink-0">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <s.icon className="size-5" />
                </span>
                <p className="font-semibold">{s.title}</p>
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{s.desc}</p>
              <div className="flex flex-wrap gap-2 sm:w-44 sm:shrink-0 sm:justify-end">
                {s.roles.map((r) => (
                  <span key={r} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", roleMeta[r].color)}>
                    {roleMeta[r].label}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t border-border bg-card">
        <SectionHeading eyebrow="Who does what" title="Role-based workflow" center />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {(Object.keys(roleMeta) as Role[]).map((role) => (
            <div key={role} className="fp-surface p-5">
              <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold", roleMeta[role].color)}>
                {roleMeta[role].label}
              </span>
              <ul className="mt-4 space-y-3 text-sm">
                {steps
                  .filter((s) => s.roles.includes(role))
                  .map((s) => (
                    <li key={s.title} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      {s.title}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="fp-surface flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Ready to try it yourself?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
