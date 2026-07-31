import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  MessageSquareText,
  Salad,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import { KpiCard } from "@/components/fp/kpi-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { addDays, BASE_DATE, formatDate, iso, weekdayName } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodPulse — Smart Mess Management. Less Waste. Better Meals." },
      {
        name: "description",
        content:
          "FoodPulse helps college messes, hostels and canteens plan meals, cut food waste and manage subscriptions with real demand data.",
      },
      { property: "og:title", content: "FoodPulse — Smart Mess Management" },
      {
        property: "og:description",
        content: "Manage meals smarter. Reduce food waste. Flexible plans, live demand forecasts and wastage analytics.",
      },
    ],
  }),
  component: Index,
});

const problems = [
  {
    icon: ClipboardList,
    title: "Manual mess management",
    desc: "Registers, WhatsApp groups and paper counts make tracking who's eating what nearly impossible.",
  },
  {
    icon: CalendarCheck,
    title: "Fixed meal planning",
    desc: "Kitchens cook the same quantity every day regardless of holidays, exams or how many students are actually present.",
  },
  {
    icon: TrendingDown,
    title: "Food wastage",
    desc: "Over-preparation with no feedback loop means excess food is thrown away meal after meal.",
  },
  {
    icon: Wallet,
    title: "Unclear billing",
    desc: "Students pay flat fees regardless of meals skipped, leading to disputes and low trust.",
  },
  {
    icon: Users,
    title: "Hard demand estimation",
    desc: "Without data, managers guess tomorrow's headcount instead of knowing it in advance.",
  },
];

const coreFeatures = [
  { icon: CalendarCheck, title: "Flexible Meal Plans", desc: "Weekly and monthly subscriptions students can choose based on their stay." },
  { icon: UtensilsCrossed, title: "Meal Selection", desc: "Students confirm breakfast, lunch and dinner for upcoming days in advance." },
  { icon: ClipboardList, title: "Meal Skip", desc: "Skip meals before the cutoff and avoid paying for food you won't eat." },
  { icon: Wallet, title: "Subscription Management", desc: "Renew, pause or cancel plans anytime from a single dashboard." },
  { icon: CreditCard, title: "Billing", desc: "Transparent invoices generated from actual meals consumed." },
  { icon: Salad, title: "Menu Management", desc: "Managers publish daily menus with special and festival meal tags." },
  { icon: MessageSquareText, title: "Feedback", desc: "Students rate meals and raise complaints that managers can resolve." },
  { icon: TrendingUp, title: "Demand Prediction", desc: "Tomorrow's expected headcount is calculated from real selections." },
  { icon: TrendingDown, title: "Food Wastage Analytics", desc: "Track prepared vs. consumed quantities to spot and reduce waste." },
  { icon: Sparkles, title: "Smart Suggestions", desc: "Actionable recommendations to trim over-preparation and cost." },
];

const flowSteps = [
  { title: "Register", desc: "Student creates an account and picks a hostel/mess." },
  { title: "Choose Plan", desc: "Selects a Weekly or Monthly subscription." },
  { title: "Select/Skip Meals", desc: "Confirms or skips upcoming breakfast, lunch, dinner." },
  { title: "Mess Uses Demand Data", desc: "Manager sees expected headcount per meal." },
  { title: "Reduce Waste", desc: "Kitchen prepares closer to real demand." },
];

function Index() {
  const { consumption } = useApp();

  const last7 = [...consumption]
    .filter((c) => c.date <= iso(BASE_DATE))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-21);

  const byDate = new Map<string, { date: string; expected: number; prepared: number; consumed: number }>();
  for (const rec of last7) {
    const cur = byDate.get(rec.date) ?? { date: rec.date, expected: 0, prepared: 0, consumed: 0 };
    cur.expected += rec.expected;
    cur.prepared += rec.prepared;
    cur.consumed += rec.consumed;
    byDate.set(rec.date, cur);
  }
  const chartData = [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((d) => ({ ...d, day: weekdayName(d.date).slice(0, 3) }));

  const totalPrepared = chartData.reduce((s, d) => s + d.prepared, 0);
  const totalConsumed = chartData.reduce((s, d) => s + d.consumed, 0);
  const wastagePct = totalPrepared > 0 ? (((totalPrepared - totalConsumed) / totalPrepared) * 100).toFixed(1) : "0.0";
  const peakDay = chartData.reduce((peak, d) => (d.expected > (peak?.expected ?? 0) ? d : peak), chartData[0]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="fp-hero-glow border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> Smart Mess Management. Less Waste. Better Meals.
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Manage Meals Smarter. Reduce Food Waste.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              FoodPulse gives college messes, hostels, PGs and office canteens a single platform to plan meals,
              track subscriptions and turn everyday meal selections into real demand data — so kitchens cook
              what's actually needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/features">Explore FoodPulse</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["246", "Students onboarded"],
                ["9.6%", "Avg. wastage"],
                ["817", "Meals served / day"],
              ].map(([v, l]) => (
                <div key={l} className="fp-surface p-4">
                  <dt className="font-display text-2xl font-semibold">{v}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="fp-surface p-5 sm:p-6">
            <p className="text-sm font-semibold">This week's meal demand</p>
            <p className="text-xs text-muted-foreground">Expected headcount, all meals combined</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Bar dataKey="expected" name="Expected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <SectionHeading
          eyebrow="The problem"
          title="Traditional mess management wastes food and trust"
          description="Manual processes leave managers guessing and students unhappy with billing."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {problems.map((p) => (
            <div key={p.title} className="fp-surface p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                <p.icon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Solution */}
      <Section className="border-y border-border bg-card">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="The solution"
              title="One platform connecting students and mess managers"
              description="FoodPulse replaces guesswork with a daily feedback loop: students tell the mess exactly which meals they want, and managers see real demand before they start cooking."
            />
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Students select or skip meals up to the cutoff time.",
                "Managers get an accurate expected headcount per meal, per day.",
                "Consumption data closes the loop, feeding wastage analytics and smart suggestions.",
                "Admins oversee plans, users and system-wide reports.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="fp-surface p-6">
            <p className="font-semibold">Why messes choose FoodPulse</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <KpiCard label="Wastage reduced" value="-34%" hint="vs. manual planning" trend={{ value: "since Feb", positive: true }} />
              <KpiCard label="Billing disputes" value="-58%" hint="fewer complaints" trend={{ value: "since Feb", positive: true }} />
              <KpiCard label="Subscriptions" value="203" hint="active this month" />
              <KpiCard label="Avg. rating" value="4.2★" hint="last 30 days" />
            </div>
          </div>
        </div>
      </Section>

      {/* Core features */}
      <Section>
        <SectionHeading eyebrow="Core features" title="Everything a mess needs, in one place" center />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {coreFeatures.map((f) => (
            <div key={f.title} className="fp-surface p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works flow */}
      <Section className="border-y border-border bg-card">
        <SectionHeading eyebrow="Simple by design" title="How FoodPulse works" center />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {flowSteps.map((s, i) => (
            <div key={s.title} className="fp-surface relative p-5">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              {i < flowSteps.length - 1 && (
                <ArrowRight className="absolute top-6 -right-3 hidden size-5 text-muted-foreground lg:block" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/how-it-works">
              See the full walkthrough <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Smart analytics */}
      <Section>
        <SectionHeading
          eyebrow="Smart analytics"
          title="Demand forecasting that keeps kitchens efficient"
          description="Every selection and skip updates tomorrow's prediction and this week's wastage numbers in real time."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="fp-surface p-5 sm:p-6">
            <p className="font-semibold">7-day meal demand vs. consumption</p>
            <p className="text-xs text-muted-foreground">Prepared vs. actually consumed, last 7 days</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Bar dataKey="prepared" name="Prepared" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumed" name="Consumed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4">
            <div className="fp-surface p-5">
              <p className="text-sm font-semibold">Tomorrow's predicted meals</p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Breakfast", 245],
                  ["Lunch", 302],
                  ["Dinner", 270],
                ].map(([m, v]) => (
                  <div key={m as string} className="rounded-lg bg-primary-soft p-3">
                    <p className="font-display text-xl font-semibold text-primary">{v}</p>
                    <p className="text-xs text-muted-foreground">{m}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="Wastage" value={`${wastagePct}%`} hint="this week" icon={<TrendingDown className="size-4" />} />
              <KpiCard
                label="Peak demand day"
                value={peakDay ? peakDay.day : "—"}
                hint={peakDay ? formatDate(peakDay.date) : ""}
                icon={<TrendingUp className="size-4" />}
              />
            </div>
            <div className="fp-surface p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="size-4" /> Smart recommendation
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sunday dinner wastage is trending above target — consider reducing preparation by ~12% and
                promoting the Saturday skip reminder earlier in the evening.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="border-t border-border">
        <div className="fp-hero-glow fp-surface flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Start Using FoodPulse</h2>
          <p className="max-w-xl text-muted-foreground">
            Join students and mess managers already reducing waste and simplifying billing with FoodPulse.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
