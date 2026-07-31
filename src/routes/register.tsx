import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/fp/logo";
import { useApp } from "@/store/app-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your FoodPulse account" },
      { name: "description", content: "Register on FoodPulse to subscribe to a mess plan and manage your daily meals." },
      { property: "og:title", content: "Create your FoodPulse account" },
      { property: "og:description", content: "Register on FoodPulse to subscribe to a mess plan and manage your daily meals." },
    ],
  }),
  component: RegisterPage,
});

interface FormState {
  name: string;
  email: string;
  contact: string;
  password: string;
  confirm: string;
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState<FormState>({ name: "", email: "", contact: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const score = strength(form.password);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!/^[0-9+\s-]{10,15}$/.test(form.contact.trim())) next.contact = "Enter a valid contact number";
    if (score < 2) next.password = "Use at least 8 characters with a number or capital letter";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    login("student");
    toast.success("Account created — welcome to FoodPulse!");
    navigate({ to: "/student" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register as a student to subscribe to a mess plan. Demo only — no data leaves your browser.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {(
            [
              ["name", "Full name", "text", "Aarav Sharma"],
              ["email", "Email", "email", "aarav.sharma@campus.edu.in"],
              ["contact", "Contact number", "tel", "+91 98450 12233"],
            ] as const
          ).map(([key, label, type, placeholder]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                aria-invalid={!!errors[key]}
              />
              {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              aria-invalid={!!errors.password}
            />
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-full flex-1 rounded-full",
                      i < score ? (score <= 1 ? "bg-destructive" : score === 2 ? "bg-warning" : "bg-success") : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{labels[score]}</span>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
