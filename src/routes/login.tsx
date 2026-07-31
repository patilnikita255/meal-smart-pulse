import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, ChefHat, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/fp/logo";
import { useApp } from "@/store/app-store";
import { roleHome } from "@/components/fp/nav-config";
import type { Role } from "@/data/types";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — FoodPulse Demo" },
      { name: "description", content: "Sign in to the FoodPulse demo as a student, mess manager or administrator." },
      { property: "og:title", content: "Login — FoodPulse Demo" },
      { property: "og:description", content: "Try the FoodPulse mess management prototype with one-click demo accounts." },
    ],
  }),
  component: LoginPage,
});

const demoRoles: { role: Role; label: string; desc: string; icon: typeof GraduationCap }[] = [
  { role: "student", label: "Login as Student", desc: "Meals, subscription, bills, feedback", icon: GraduationCap },
  { role: "manager", label: "Login as Mess Manager", desc: "Menu, consumption, wastage, analytics", icon: ChefHat },
  { role: "admin", label: "Login as Admin", desc: "Users, plans, reports, audit logs", icon: ShieldCheck },
];

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const enter = (role: Role) => {
    login(role);
    toast.success(`Signed in to the ${role} demo`);
    navigate({ to: roleHome[role] });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const role: Role = email.includes("admin") ? "admin" : email.includes("mess") || email.includes("manager") ? "manager" : "student";
    enter(role);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="fp-hero-glow hidden flex-col justify-between p-10 lg:flex">
        <Logo />
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight font-semibold">
            Manage meals smarter. Reduce food waste.
          </h1>
          <p className="mt-4 text-muted-foreground">
            FoodPulse turns daily meal selections into demand forecasts, so the kitchen cooks what's actually
            eaten — and students only pay for meals they want.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["9.6%", "Avg. wastage"],
              ["246", "Students"],
              ["817", "Meals / day"],
            ].map(([v, l]) => (
              <div key={l} className="fp-surface p-4">
                <dt className="font-display text-2xl font-semibold">{v}</dt>
                <dd className="text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-xs text-muted-foreground">
          Frontend demonstration prototype — no real authentication or payments.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your FoodPulse workspace.</p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu.in"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox id="remember" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR TRY A DEMO ACCOUNT <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {demoRoles.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => enter(d.role)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <d.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{d.desc}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to FoodPulse?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
