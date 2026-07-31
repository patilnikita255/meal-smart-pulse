import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StarRating } from "@/components/fp/star-rating";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, todayISO } from "@/data/mock";
import { MEAL_TYPES, type MealType } from "@/data/types";

export const Route = createFileRoute("/student/feedback")({
  head: () => ({
    meta: [
      { title: "Give Feedback — FoodPulse Student Portal" },
      { name: "description", content: "Rate your meals or raise a complaint/suggestion." },
      { property: "og:title", content: "Give Feedback — FoodPulse Student Portal" },
      { property: "og:description", content: "Share meal ratings and complaints with the mess team." },
    ],
  }),
  component: FeedbackPage,
});

const CATEGORIES = ["Food Quality", "Hygiene", "Service", "Quantity", "Suggestion"] as const;

function FeedbackPage() {
  const { currentUser, addFeedback, addComplaint } = useApp();

  const [fMeal, setFMeal] = useState<MealType>("Lunch");
  const [fDate, setFDate] = useState(todayISO());
  const [fRating, setFRating] = useState<number | null>(null);
  const [fComment, setFComment] = useState("");
  const [fErrors, setFErrors] = useState<{ rating?: string }>({});

  const [cMeal, setCMeal] = useState<MealType>("Lunch");
  const [cDate, setCDate] = useState(todayISO());
  const [cCategory, setCCategory] = useState<(typeof CATEGORIES)[number]>("Food Quality");
  const [cDesc, setCDesc] = useState("");
  const [cErrors, setCErrors] = useState<{ desc?: string }>({});

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fRating) {
      setFErrors({ rating: "Please select a rating" });
      return;
    }
    setFErrors({});
    addFeedback({
      studentId: CURRENT_STUDENT_ID,
      studentName: currentUser?.name ?? "Student",
      date: fDate,
      meal: fMeal,
      rating: fRating,
      ...(fComment ? { comment: fComment } : {}),
    });
    toast.success("Thanks for rating your meal!");
    setFRating(null);
    setFComment("");
  };

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (cDesc.trim().length < 10) {
      setCErrors({ desc: "Please describe the issue in at least 10 characters" });
      return;
    }
    setCErrors({});
    addComplaint({
      studentId: CURRENT_STUDENT_ID,
      studentName: currentUser?.name ?? "Student",
      date: cDate,
      meal: cMeal,
      category: cCategory,
      description: cDesc.trim(),
    });
    toast.success("Your complaint/suggestion has been submitted");
    setCDesc("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Give Feedback"
        description="Rate your meals and let us know about any issues."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Feedback" }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Rate a Meal">
          <form onSubmit={submitFeedback} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Meal</Label>
                <Select value={fMeal} onValueChange={(v) => setFMeal(v as MealType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEAL_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fdate">Date</Label>
                <Input id="fdate" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <StarRating value={fRating} onChange={setFRating} label="Rate this meal" />
              {fErrors.rating && <p className="text-xs text-destructive">{fErrors.rating}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fcomment">Comment (optional)</Label>
              <Textarea id="fcomment" value={fComment} onChange={(e) => setFComment(e.target.value)} rows={3} placeholder="What did you like or dislike?" />
            </div>
            <Button type="submit">Submit Rating</Button>
          </form>
        </SectionCard>

        <SectionCard title="Complaint / Suggestion">
          <form onSubmit={submitComplaint} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Meal</Label>
                <Select value={cMeal} onValueChange={(v) => setCMeal(v as MealType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEAL_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cdate">Date</Label>
                <Input id="cdate" type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={cCategory} onValueChange={(v) => setCCategory(v as (typeof CATEGORIES)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cdesc">Description</Label>
              <Textarea
                id="cdesc"
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                rows={4}
                placeholder="Describe the issue or suggestion in detail…"
                aria-invalid={!!cErrors.desc}
              />
              {cErrors.desc && <p className="text-xs text-destructive">{cErrors.desc}</p>}
            </div>
            <Button type="submit">Submit Complaint</Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
