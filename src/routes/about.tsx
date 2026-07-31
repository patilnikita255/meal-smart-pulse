import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, GraduationCap, Home, UtensilsCrossed, Target, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FoodPulse — Smart Mess Management Platform" },
      {
        name: "description",
        content: "Learn what FoodPulse is, who it's built for, and the objectives behind smarter, lower-waste mess management.",
      },
      { property: "og:title", content: "About FoodPulse" },
      { property: "og:description", content: "FoodPulse connects students and mess managers to reduce food waste and simplify billing." },
    ],
  }),
  component: AboutPage,
});

const environments = [
  { icon: GraduationCap, title: "College Mess", desc: "Daily meal planning for hundreds of students across hostels and departments." },
  { icon: Home, title: "Hostel", desc: "Track subscriptions, skips and billing for residential students." },
  { icon: Building2, title: "PG Accommodation", desc: "Simple meal management for paying-guest facilities with shared kitchens." },
  { icon: UtensilsCrossed, title: "Office Canteen", desc: "Forecast daily headcount for corporate cafeterias to reduce over-preparation." },
];

const objectives = [
  "Give students full control over which meals they eat and pay for.",
  "Replace guesswork with real, day-by-day demand data for mess managers.",
  "Reduce food wastage through consumption tracking and analytics.",
  "Make billing transparent and tied to actual meals consumed.",
  "Provide admins with system-wide visibility into users, plans and reports.",
  "Create a feedback loop between students and managers via ratings and complaints.",
];

const futureEnhancements = [
  "UPI / card / wallet payment gateway integration",
  "Machine-learning based demand forecasting",
  "QR code meal verification at the counter",
  "IoT kitchen integration for automated consumption tracking",
  "Native mobile apps (iOS and Android)",
  "AI chatbot for student support and FAQs",
];

function AboutPage() {
  return (
    <PublicLayout>
      <Section className="fp-hero-glow border-b border-border pt-16 sm:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="About FoodPulse"
          title="A smarter way to run a mess, hostel or canteen"
          description='FoodPulse is a mess management platform that turns everyday meal selections into demand data — so kitchens cook closer to what people actually eat. Tagline: "Smart Mess Management. Less Waste. Better Meals."'
        />
      </Section>

      <Section>
        <SectionHeading eyebrow="Purpose" title="Why FoodPulse exists" />
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Most college messes and canteens still plan meals manually — fixed quantities, paper registers and
          little visibility into who's actually eating. This leads to food waste, unclear bills and frustrated
          students. FoodPulse gives every stakeholder — student, mess manager and admin — a shared, data-driven
          view of meals, so decisions are based on real demand instead of estimates.
        </p>
      </Section>

      <Section className="border-y border-border bg-card">
        <SectionHeading eyebrow="Where it's used" title="Built for shared dining environments" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {environments.map((e) => (
            <div key={e.title} className="fp-surface p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <e.icon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">{e.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Objectives" title="What FoodPulse aims to achieve" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {objectives.map((o) => (
            <div key={o} className="fp-surface flex items-start gap-3 p-4">
              <Target className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm">{o}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-card">
        <SectionHeading
          eyebrow="Roadmap"
          title="Future enhancements (not implemented)"
          description="This prototype focuses on the core meal management workflow. The items below are planned ideas — not available in this demo."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {futureEnhancements.map((f) => (
            <li key={f} className="fp-surface flex items-start gap-3 p-4">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="fp-surface flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">See it in action</h2>
          <p className="max-w-lg text-muted-foreground">Explore the features or try a live demo account.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/features">Explore Features</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Try a Demo</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
