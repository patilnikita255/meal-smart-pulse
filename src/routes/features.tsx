import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  ChefHat,
  ShieldCheck,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "FoodPulse Features — Student, Manager, Admin & Analytics" },
      {
        name: "description",
        content: "Detailed FoodPulse features grouped by student, mess manager, admin and smart analytics capabilities.",
      },
      { property: "og:title", content: "FoodPulse Features" },
      { property: "og:description", content: "Explore every FoodPulse capability across student, manager, admin and analytics roles." },
    ],
  }),
  component: FeaturesPage,
});

const groups = [
  {
    icon: GraduationCap,
    title: "For Students",
    color: "bg-primary-soft text-primary",
    desc: "Full control over meal plans, selections and bills.",
    points: [
      "Browse and subscribe to Weekly or Monthly meal plans",
      "Select or skip individual meals up to the daily cutoff time",
      "View a meal calendar with attendance and rating history",
      "Pause, cancel or renew a subscription",
      "View itemised bills and payment history",
      "Rate meals and submit complaints with category and description",
      "Get notified about deadlines, expiry and payment reminders",
    ],
  },
  {
    icon: ChefHat,
    title: "For Mess Managers",
    color: "bg-info/10 text-info",
    desc: "Plan and track meals with real demand data.",
    points: [
      "See expected headcount per meal, per day",
      "Publish and update daily menus, including special/festival meals",
      "Record prepared and consumed quantities for each meal",
      "Track wastage percentage trends over time",
      "Respond to student complaints and update their status",
      "View feedback ratings and comments per meal",
      "Access consumption and wastage reports for their mess",
    ],
  },
  {
    icon: ShieldCheck,
    title: "For Admins",
    color: "bg-warning/10 text-warning",
    desc: "System-wide oversight of users, plans and operations.",
    points: [
      "Manage all student, manager and admin user accounts",
      "Create, edit and activate/deactivate subscription plans",
      "Oversee payments across all subscriptions",
      "View system-wide reports across all messes",
      "Review a full audit log of key actions",
      "Configure system settings — meal timings, cutoff time, notifications",
    ],
  },
  {
    icon: LineChart,
    title: "Smart Analytics",
    color: "bg-success/10 text-success",
    desc: "Turning meal selections into actionable insight.",
    points: [
      "Daily demand prediction from live meal selections",
      "Prepared vs. consumed comparison charts",
      "Wastage percentage tracking against a target threshold",
      "Peak demand day identification",
      "Monthly trend charts for users, subscriptions and revenue",
      "Smart recommendations to reduce over-preparation",
    ],
  },
];

function FeaturesPage() {
  return (
    <PublicLayout>
      <Section className="fp-hero-glow border-b border-border pt-16 sm:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Features"
          title="Everything each role needs, built in"
          description="FoodPulse organizes features around the people who use them every day — students, mess managers, admins — backed by shared analytics."
        />
      </Section>

      {groups.map((g, i) => (
        <Section key={g.title} {...(i % 2 === 1 ? { className: "border-y border-border bg-card" } : {})}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
            <div>
              <span className={`grid size-12 place-items-center rounded-xl ${g.color}`}>
                <g.icon className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold">{g.title}</h2>
              <p className="mt-2 text-muted-foreground">{g.desc}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {g.points.map((p) => (
                <li key={p} className="fp-surface flex items-start gap-2 p-4 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ))}

      <Section>
        <div className="fp-surface flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Try FoodPulse for your role</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Login with a demo account</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
