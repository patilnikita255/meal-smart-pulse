import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/fp/logo";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Features", to: "/features" },
  { label: "Help", to: "/help" },
  { label: "Contact", to: "/contact" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
          <Logo />
          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Get Started</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mt-6 flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    Login
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Smart Mess Management. Less Waste. Better Meals.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground">Help & FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Demo access</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground">Student demo</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Mess manager demo</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Admin demo</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          © 2026 FoodPulse · Frontend demonstration prototype — no real payments or backend services.
        </div>
      </footer>
    </div>
  );
}
