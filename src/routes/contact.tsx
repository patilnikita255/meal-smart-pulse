import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/fp/public-layout";
import { Section, SectionHeading } from "@/components/fp/marketing/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact FoodPulse" },
      {
        name: "description",
        content: "Get in touch with the FoodPulse team — send a message or reach the mess office directly.",
      },
      { property: "og:title", content: "Contact FoodPulse" },
      { property: "og:description", content: "Reach out with questions about FoodPulse mess management." },
    ],
  }),
  component: ContactPage,
});

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.subject.trim()) next.subject = "Subject is required";
    if (!form.message.trim()) next.message = "Message is required";
    else if (form.message.trim().length < 10) next.message = "Message should be at least 10 characters";
    return next;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
    toast.success("Message sent — the FoodPulse team will get back to you soon.");
  };

  const resetForm = () => {
    setForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <PublicLayout>
      <Section className="fp-hero-glow border-b border-border pt-16 sm:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Contact us"
          title="We'd love to hear from you"
          description="Questions about FoodPulse, feedback on the prototype, or a query for your mess office — send us a message."
        />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="fp-surface p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 className="font-display text-xl font-semibold">Message sent</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Thanks, {form.name.split(" ")[0]}! We've received your message and will respond by email shortly.
                </p>
                <Button variant="outline" onClick={resetForm} className="mt-2">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Aarav Sharma"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && <p id="name-error" className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@campus.edu.in"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="Question about subscription plans"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                  />
                  {errors.subject && <p id="subject-error" className="text-xs text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us how we can help..."
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && <p id="message-error" className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg">
                  Send message
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="fp-surface p-6">
              <p className="font-semibold">North Campus Mess Office</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> Block C, North Campus Hostel Complex, Bengaluru 560001
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" /> +91 98450 12233
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" /> support@foodpulse.in
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" /> Mon–Sun, 7:00 AM – 9:30 PM
                </li>
              </ul>
            </div>
            <div className="fp-surface p-6">
              <p className="font-semibold">Prefer to try it yourself?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the demo login accounts to explore the student, mess manager and admin experiences without
                waiting for a reply.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
