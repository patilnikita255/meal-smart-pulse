import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — FoodPulse" },
      {
        name: "description",
        content: "Frequently asked questions and quick-start guides for students, mess managers and admins on FoodPulse.",
      },
      { property: "og:title", content: "FoodPulse Help & FAQ" },
      { property: "og:description", content: "Find answers about registration, subscriptions, meal selection, payments and more." },
    ],
  }),
  component: HelpPage,
});

const faqCategories: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Registration",
    items: [
      { q: "How do I create a FoodPulse account?", a: "Go to the Register page, enter your name, email and hostel/mess details, then set a password. You'll be redirected to your student dashboard." },
      { q: "Can mess managers and admins register themselves?", a: "In this demo, manager and admin accounts are pre-provisioned. Use the demo login buttons on the Login page to explore those roles." },
    ],
  },
  {
    category: "Subscription",
    items: [
      { q: "What plans are available?", a: "FoodPulse offers a Weekly Plan and Monthly Plan (including a Lunch+Dinner only Monthly Lite option). Compare and subscribe from Student → Subscription." },
      { q: "Can I pause or cancel my subscription?", a: "Yes. From Student → Subscription, request a pause or cancellation; the request status is shown until an admin/manager confirms it." },
    ],
  },
  {
    category: "Meal selection",
    items: [
      { q: "Where do I select upcoming meals?", a: "Use Student → Meal Calendar to select Breakfast, Lunch and Dinner for upcoming dates." },
      { q: "What happens if I don't select a meal?", a: "By default meals are marked Selected; you must explicitly skip a meal if you don't plan to eat it." },
    ],
  },
  {
    category: "Meal skipping",
    items: [
      { q: "How do I skip a meal?", a: "On the Meal Calendar, toggle a meal to 'Skipped' before the cutoff time for that date." },
      { q: "Can I skip a meal on the same day?", a: "No — meals are locked at 10:00 PM the previous day, after which the selection can no longer be changed." },
    ],
  },
  {
    category: "Cutoff deadline",
    items: [
      { q: "What is the cutoff time?", a: "The default cutoff is 10:00 PM the night before a meal date. Admins can adjust this in Admin → Settings." },
      { q: "Why is a meal shown as locked?", a: "Once the cutoff passes, that meal's selection becomes read-only so the mess can plan preparation with confidence." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "How do I check my bills?", a: "Go to Student → Billing to see invoices, amounts and payment status." },
      { q: "What payment methods are supported?", a: "This prototype does not process real payments — invoices are marked Paid/Unpaid for demonstration. A real payment gateway is a planned future enhancement." },
    ],
  },
  {
    category: "Menu",
    items: [
      { q: "Where can I see today's menu?", a: "The Student dashboard and Meal Calendar show the published menu for each date and meal." },
      { q: "Who updates the menu?", a: "Mess managers publish and update menus from Manager → Menu Management, including marking special or festival meals." },
    ],
  },
  {
    category: "Feedback",
    items: [
      { q: "How do I rate a meal?", a: "After a meal is marked Attended, rate it from Student → Meal Calendar or the Feedback section." },
      { q: "Can managers see feedback?", a: "Yes, managers view aggregated ratings and comments from Manager → Feedback." },
    ],
  },
  {
    category: "Complaints",
    items: [
      { q: "How do I raise a complaint?", a: "Go to Student → Feedback & Complaints, choose a category (Food Quality, Hygiene, Service, Quantity, Suggestion) and describe the issue." },
      { q: "How are complaints resolved?", a: "Mess managers update the status through OPEN → IN PROGRESS → RESOLVED and can add a response visible to the student." },
    ],
  },
  {
    category: "Analytics",
    items: [
      { q: "Where can I see wastage analytics?", a: "Manager → Analytics and Admin → Reports show wastage percentage, demand vs. consumption charts and trends." },
      { q: "How is demand predicted?", a: "FoodPulse aggregates current meal selections and historical consumption records to estimate tomorrow's expected headcount." },
    ],
  },
];

const quickStarts = [
  {
    role: "student",
    label: "Student Quick Start",
    steps: [
      "Register at /register or log in at /login.",
      "Visit Student → Subscription and choose a Weekly or Monthly plan.",
      "Open Student → Meal Calendar to select or skip upcoming meals before 10:00 PM the day before.",
      "Check Student → Billing after each cycle to review your invoice.",
      "Rate meals and raise complaints from Student → Feedback & Complaints.",
    ],
  },
  {
    role: "manager",
    label: "Mess Manager Guide",
    steps: [
      "Log in with the Mess Manager demo account from /login.",
      "Open Manager → Dashboard to see today's and tomorrow's expected headcount.",
      "Publish the day's menu from Manager → Menu Management.",
      "After service, record prepared/consumed quantities in Manager → Consumption.",
      "Review Manager → Analytics for wastage trends and respond to complaints in Manager → Complaints.",
    ],
  },
  {
    role: "admin",
    label: "Admin Guide",
    steps: [
      "Log in with the Admin demo account from /login.",
      "Manage accounts from Admin → Users (activate/deactivate students and managers).",
      "Create or edit subscription plans from Admin → Plans.",
      "Monitor payments across the system in Admin → Payments.",
      "Review Admin → Reports for system-wide trends and Admin → Audit Log for a history of key actions.",
      "Adjust meal timings, cutoff time and notification rules in Admin → Settings.",
    ],
  },
];

function HelpPage() {
  return (
    <PublicLayout>
      <Section className="fp-hero-glow border-b border-border pt-16 sm:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Help & FAQ"
          title="Answers and quick-start guides"
          description="Find answers to common questions, or jump straight into a step-by-step guide for your role."
        />
      </Section>

      <Section>
        <h2 className="font-display text-2xl font-semibold">Frequently asked questions</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {faqCategories.map((cat) => (
            <div key={cat.category}>
              <p className="text-sm font-semibold text-primary">{cat.category}</p>
              <Accordion type="single" collapsible className="mt-2">
                {cat.items.map((item, idx) => (
                  <AccordionItem key={item.q} value={`${cat.category}-${idx}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-card">
        <SectionHeading eyebrow="Get started fast" title="Quick-start guides" />
        <Tabs defaultValue="student" className="mt-6">
          <TabsList>
            {quickStarts.map((q) => (
              <TabsTrigger key={q.role} value={q.role}>
                {q.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {quickStarts.map((q) => (
            <TabsContent key={q.role} value={q.role} className="mt-4">
              <ol className="fp-surface space-y-3 p-6">
                {q.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </Section>
    </PublicLayout>
  );
}
