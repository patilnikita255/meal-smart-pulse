import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/fp/logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your FoodPulse password" },
      { name: "description", content: "Request a password reset link for your FoodPulse mess account." },
      { property: "og:title", content: "Reset your FoodPulse password" },
      { property: "og:description", content: "Request a password reset link for your FoodPulse mess account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo />
        {sent ? (
          <div className="fp-surface mt-6 p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-success/12 text-success">
              <MailCheck className="size-6" />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold">Reset link sent</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If <span className="font-medium text-foreground">{email}</span> is registered, a password reset link
              has been sent. This is a simulated step in the FoodPulse demo.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link to="/login">Back to login</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-2xl font-semibold">Forgot your password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your registered email and we'll send you a reset link.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu.in"
                  aria-invalid={!!error}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
