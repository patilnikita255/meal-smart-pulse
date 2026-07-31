import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, CreditCard, Utensils } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/student/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — FoodPulse Student Portal" },
      { name: "description", content: "Quick start guide, cutoff rules and frequently asked questions." },
      { property: "og:title", content: "Help & FAQ — FoodPulse Student Portal" },
      { property: "og:description", content: "Get help using the FoodPulse student portal." },
    ],
  }),
  component: HelpPage,
});

const STEPS = [
  { icon: ClipboardList, title: "Subscribe to a plan", desc: "Visit Available Plans and pick a Weekly or Monthly plan that suits you." },
  { icon: CalendarCheck, title: "Select your meals daily", desc: "Use the Meal Calendar to select or skip Breakfast, Lunch and Dinner before the cutoff." },
  { icon: Utensils, title: "Attend & rate your meals", desc: "After eating, rate meals from Meal History to help the mess team improve." },
  { icon: CreditCard, title: "Pay your bill", desc: "Check Current Bill for dues and mark payments as done (demo)." },
];

const FAQS = [
  { q: "What is the meal selection cutoff?", a: "You must confirm or skip a meal by 10:00 PM the previous day. After this, the meal locks and cannot be changed." },
  { q: "Can I change a meal after the cutoff?", a: "No. Once locked, the selection is final for that meal. You can still rate it afterwards from Meal History." },
  { q: "How do I pause my subscription?", a: "Go to My Subscription and click Request Pause. The mess manager will review and approve your request." },
  { q: "How do payments work in this demo?", a: "FoodPulse is a frontend prototype without a real payment gateway. Use 'Mark as Demo Payment' on the Current Bill page to simulate payment." },
  { q: "Where can I raise a complaint?", a: "Use the Give Feedback page to submit a Complaint or Suggestion. Track responses under My Complaints." },
];

function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help & Support" description="Everything you need to use the student portal." breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Help" }]} />

      <SectionCard title="Quick Start">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border p-4">
              <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"><s.icon className="size-4" /></span>
              <p className="mt-3 text-sm font-semibold">{i + 1}. {s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Cutoff Rules">
        <p className="text-sm text-muted-foreground">
          Meal selections must be made by <strong>10:00 PM the previous day</strong>. Once locked, meals cannot be
          selected or skipped, and attendance is recorded automatically based on your last confirmed selection.
        </p>
      </SectionCard>

      <SectionCard title="Frequently Asked Questions">
        <Accordion type="single" collapsible>
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionCard>

      <SectionCard title="Still need help?">
        <p className="text-sm text-muted-foreground">Reach out to our support team for anything not covered above.</p>
        <Button asChild className="mt-3"><Link to="/contact">Contact Us</Link></Button>
      </SectionCard>
    </div>
  );
}
