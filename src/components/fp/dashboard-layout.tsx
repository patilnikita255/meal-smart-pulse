import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, RotateCcw, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Logo } from "@/components/fp/logo";
import { navByRole, roleHome, roleLabel } from "@/components/fp/nav-config";
import { useApp } from "@/store/app-store";
import type { Role } from "@/data/types";
import { formatMoney } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function useRoleGuard(role: Role) {
  const { hydrated, role: current } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    if (current === null) {
      navigate({ to: "/login", replace: true });
    } else if (current !== role) {
      navigate({ to: roleHome[current], replace: true });
    }
  }, [hydrated, current, role, navigate]);
  return hydrated && current === role;
}

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-5 px-3 py-4" aria-label="Main navigation">
      {navByRole[role].map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NotificationBell({ role }: { role: Role }) {
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const list = notifications.filter((n) => n.role === role);
  const unread = list.filter((n) => !n.read).length;
  const toneDot: Record<string, string> = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive",
    info: "bg-info",
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={() => markAllRead(role)}>
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markNotificationRead(n.id)}
                  className={cn("w-full px-4 py-3 text-left hover:bg-muted/60", !n.read && "bg-primary-soft/40")}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot[n.type])} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to={`${roleHome[role]}/notifications` as never}>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function GlobalSearch({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const { users, plans, payments, subscriptions, complaints, menus } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  const groups = useMemo(
    () => ({
      students: users.filter((u) => u.role === "student").slice(0, 30),
      plans,
      payments: payments.slice(0, 30),
      subscriptions: subscriptions.slice(0, 30),
      complaints,
      menus: menus.slice(0, 30),
    }),
    [users, plans, payments, subscriptions, complaints, menus],
  );

  const base = roleHome[role];

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden w-56 justify-start gap-2 text-muted-foreground md:flex lg:w-72"
      >
        <Search className="size-4" />
        <span className="truncate text-sm">Search FoodPulse…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setOpen(true)}>
        <Search className="size-4" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search students, plans, payments, complaints, menus…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Students">
            {groups.students.map((u) => (
              <CommandItem key={u.id} value={`${u.name} ${u.email}`} onSelect={() => go(base === "/student" ? "/student/profile" : `${base}/users`)}>
                {u.name} — <span className="text-muted-foreground">{u.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Plans">
            {groups.plans.map((p) => (
              <CommandItem key={p.id} value={`${p.name} ${p.type}`} onSelect={() => go(base === "/student" ? "/student/plans" : `${base}/plans`)}>
                {p.name} — {formatMoney(p.price)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Payments">
            {groups.payments.map((p) => (
              <CommandItem key={p.id} value={`${p.invoice} ${p.studentName}`} onSelect={() => go(`${base}/payments`)}>
                {p.invoice} — {p.studentName} — {formatMoney(p.amount)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Complaints">
            {groups.complaints.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.id} ${c.studentName} ${c.description}`}
                onSelect={() => go(base === "/student" ? "/student/complaints" : `${base}/feedback`)}
              >
                {c.id} — {c.category} — {c.status}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Menu items">
            {groups.menus.map((m) => (
              <CommandItem key={m.id} value={`${m.date} ${m.meal} ${m.items}`} onSelect={() => go(base === "/manager" ? "/manager/menu" : base)}>
                {m.date} · {m.meal} — <span className="truncate text-muted-foreground">{m.items}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function DashboardLayout({ role, children }: { role: Role; children: ReactNode }) {
  const ok = useRoleGuard(role);
  const { currentUser, logout, resetDemoData } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your FoodPulse workspace…</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Signed out of the FoodPulse demo");
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Logo />
        </div>
        <ScrollArea className="flex-1">
          <SidebarNav role={role} />
        </ScrollArea>
        <div className="border-t border-sidebar-border p-3">
          <p className="px-2 text-[11px] text-muted-foreground">Demo role</p>
          <p className="px-2 text-sm font-semibold">{roleLabel[role]}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-border px-4">
                <Logo />
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Logo compact />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <GlobalSearch role={role} />
            <NotificationBell role={role} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                    {currentUser?.name.charAt(0) ?? "F"}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-32 truncate text-sm font-medium">{currentUser?.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{roleLabel[role]}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{currentUser?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: `${roleHome[role]}/profile` })}>
                  <UserIcon className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    resetDemoData();
                    toast.success("Demo data reset to defaults");
                    navigate({ to: "/login", replace: true });
                  }}
                >
                  <RotateCcw className="mr-2 size-4" /> Reset demo data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-3 py-6 pb-24 sm:px-5 lg:pb-10">{children}</main>

        {/* Mobile quick navigation */}
        <nav
          aria-label="Quick navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        >
          {navByRole[role]
            .flatMap((g) => g.items)
            .slice(0, 4)
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground data-[status=active]:text-primary"
              >
                <item.icon className="size-4" />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            ))}
        </nav>
      </div>
    </div>
  );
}
