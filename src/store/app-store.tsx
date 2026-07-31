import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  auditLogs as seedAudit,
  complaints as seedComplaints,
  consumption as seedConsumption,
  defaultSettings,
  DEMO_ACCOUNTS,
  feedback as seedFeedback,
  mealRecords as seedMeals,
  menus as seedMenus,
  notifications as seedNotifications,
  payments as seedPayments,
  plans as seedPlans,
  subscriptions as seedSubs,
  users as seedUsers,
  CURRENT_STUDENT_ID,
  todayISO,
} from "@/data/mock";
import type {
  AppNotification,
  AppUser,
  AuditLog,
  Complaint,
  ConsumptionRecord,
  FeedbackEntry,
  MealRecord,
  MealType,
  MenuEntry,
  Payment,
  Plan,
  Role,
  Subscription,
  SystemSettings,
} from "@/data/types";

const STORAGE_KEY = "foodpulse-state-v1";

interface PersistedState {
  role: Role | null;
  currentUserId: string | null;
  users: AppUser[];
  plans: Plan[];
  subscriptions: Subscription[];
  meals: MealRecord[];
  payments: Payment[];
  menus: MenuEntry[];
  complaints: Complaint[];
  feedback: FeedbackEntry[];
  consumption: ConsumptionRecord[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

function seedState(): PersistedState {
  return {
    role: null,
    currentUserId: null,
    users: seedUsers,
    plans: seedPlans,
    subscriptions: seedSubs,
    meals: seedMeals,
    payments: seedPayments,
    menus: seedMenus,
    complaints: seedComplaints,
    feedback: seedFeedback,
    consumption: seedConsumption,
    notifications: seedNotifications,
    auditLogs: seedAudit,
    settings: defaultSettings,
  };
}

interface AppStore extends PersistedState {
  hydrated: boolean;
  currentUser: AppUser | null;
  login: (role: Role) => void;
  logout: () => void;
  resetDemoData: () => void;

  // meals
  setMealSelection: (date: string, meal: MealType, selection: "Selected" | "Skipped") => void;
  rateMeal: (id: string, rating: number, feedback?: string) => void;
  isLocked: (date: string) => boolean;

  // subscription
  subscribeToPlan: (planId: string) => void;
  requestSubscriptionChange: (kind: "pause" | "cancel") => void;
  renewSubscription: () => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;

  // plans
  upsertPlan: (plan: Plan) => void;
  togglePlanStatus: (id: string) => void;

  // users
  upsertUser: (user: AppUser) => void;
  toggleUserStatus: (id: string) => void;

  // payments
  setPaymentStatus: (id: string, status: "Paid" | "Unpaid") => void;

  // menus
  upsertMenu: (entry: MenuEntry) => void;
  deactivateMenu: (id: string) => void;

  // complaints & feedback
  addComplaint: (c: Omit<Complaint, "id" | "status">) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  addFeedback: (f: Omit<FeedbackEntry, "id">) => void;

  // consumption
  saveConsumption: (record: Omit<ConsumptionRecord, "id">) => void;

  // notifications
  markNotificationRead: (id: string) => void;
  markAllRead: (role: Role) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;

  // settings
  updateSettings: (patch: Partial<SystemSettings>) => void;

  // audit
  logAction: (entry: Omit<AuditLog, "id" | "timestamp">) => void;

  currentSubscription: Subscription | null;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...seedState(), ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* ignore corrupted demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: PersistedState) => PersistedState) => setState((s) => fn(s)), []);

  const logAction = useCallback<AppStore["logAction"]>(
    (entry) =>
      patch((s) => ({
        ...s,
        auditLogs: [
          {
            ...entry,
            id: `LOG-${Math.floor(Math.random() * 9000) + 3000}`,
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          },
          ...s.auditLogs,
        ],
      })),
    [patch],
  );

  const value = useMemo<AppStore>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
    const currentSubscription =
      state.subscriptions.find((s) => s.studentId === CURRENT_STUDENT_ID) ?? null;

    return {
      ...state,
      hydrated,
      currentUser,
      currentSubscription,
      login: (role) =>
        patch((s) => ({ ...s, role, currentUserId: DEMO_ACCOUNTS[role].id })),
      logout: () => patch((s) => ({ ...s, role: null, currentUserId: null })),
      resetDemoData: () => setState(seedState()),

      isLocked: (date) => date <= todayISO(),

      setMealSelection: (date, meal, selection) =>
        patch((s) => ({
          ...s,
          meals: s.meals.map((m) =>
            m.date === date && m.meal === meal && m.studentId === CURRENT_STUDENT_ID
              ? { ...m, selection }
              : m,
          ),
        })),

      rateMeal: (id, rating, fb) =>
        patch((s) => ({
          ...s,
          meals: s.meals.map((m) => (m.id === id ? { ...m, rating, ...(fb ? { feedback: fb } : {}) } : m)),
        })),

      subscribeToPlan: (planId) =>
        patch((s) => {
          const plan = s.plans.find((p) => p.id === planId);
          if (!plan) return s;
          const start = new Date();
          const end = new Date();
          end.setDate(end.getDate() + plan.durationDays);
          return {
            ...s,
            subscriptions: s.subscriptions.map((sub) =>
              sub.studentId === CURRENT_STUDENT_ID
                ? {
                    ...sub,
                    planId: plan.id,
                    planName: plan.name,
                    startDate: start.toISOString().slice(0, 10),
                    endDate: end.toISOString().slice(0, 10),
                    totalMeals: plan.meals,
                    usedMeals: 0,
                    status: "Active",
                    paymentStatus: "Unpaid",
                    requestStatus: null,
                  }
                : sub,
            ),
          };
        }),

      requestSubscriptionChange: (kind) =>
        patch((s) => ({
          ...s,
          subscriptions: s.subscriptions.map((sub) =>
            sub.studentId === CURRENT_STUDENT_ID
              ? {
                  ...sub,
                  requestStatus:
                    kind === "cancel" ? "Cancellation Request Pending" : "Pause Request Pending",
                }
              : sub,
          ),
        })),

      renewSubscription: () =>
        patch((s) => ({
          ...s,
          subscriptions: s.subscriptions.map((sub) => {
            if (sub.studentId !== CURRENT_STUDENT_ID) return sub;
            const plan = s.plans.find((p) => p.id === sub.planId);
            const end = new Date();
            end.setDate(end.getDate() + (plan?.durationDays ?? 30));
            return {
              ...sub,
              status: "Active" as const,
              startDate: new Date().toISOString().slice(0, 10),
              endDate: end.toISOString().slice(0, 10),
              usedMeals: 0,
              requestStatus: null,
            };
          }),
        })),

      updateSubscription: (id, p) =>
        patch((s) => ({
          ...s,
          subscriptions: s.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...p } : sub)),
        })),

      upsertPlan: (plan) =>
        patch((s) => ({
          ...s,
          plans: s.plans.some((p) => p.id === plan.id)
            ? s.plans.map((p) => (p.id === plan.id ? plan : p))
            : [...s.plans, plan],
        })),

      togglePlanStatus: (id) =>
        patch((s) => ({
          ...s,
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p,
          ),
        })),

      upsertUser: (user) =>
        patch((s) => ({
          ...s,
          users: s.users.some((u) => u.id === user.id)
            ? s.users.map((u) => (u.id === user.id ? user : u))
            : [...s.users, user],
        })),

      toggleUserStatus: (id) =>
        patch((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u,
          ),
        })),

      setPaymentStatus: (id, status) =>
        patch((s) => ({
          ...s,
          payments: s.payments.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      upsertMenu: (entry) =>
        patch((s) => ({
          ...s,
          menus: s.menus.some((m) => m.id === entry.id)
            ? s.menus.map((m) => (m.id === entry.id ? entry : m))
            : [entry, ...s.menus],
        })),

      deactivateMenu: (id) =>
        patch((s) => ({ ...s, menus: s.menus.map((m) => (m.id === id ? { ...m, active: false } : m)) })),

      addComplaint: (c) =>
        patch((s) => ({
          ...s,
          complaints: [
            { ...c, id: `CMP-${1050 + s.complaints.length}`, status: "OPEN" as const },
            ...s.complaints,
          ],
        })),

      updateComplaint: (id, p) =>
        patch((s) => ({
          ...s,
          complaints: s.complaints.map((c) => (c.id === id ? { ...c, ...p } : c)),
        })),

      addFeedback: (f) =>
        patch((s) => ({ ...s, feedback: [{ ...f, id: `FB-${s.feedback.length + 1}` }, ...s.feedback] })),

      saveConsumption: (record) =>
        patch((s) => {
          const id = `CON-${record.date}-${record.meal}`;
          return {
            ...s,
            consumption: s.consumption.some((c) => c.id === id)
              ? s.consumption.map((c) => (c.id === id ? { ...record, id } : c))
              : [...s.consumption, { ...record, id }],
          };
        }),

      markNotificationRead: (id) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: (role) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)),
        })),

      pushNotification: (n) =>
        patch((s) => ({
          ...s,
          notifications: [
            { ...n, id: `N-${Date.now()}`, time: "Just now", read: false },
            ...s.notifications,
          ],
        })),

      updateSettings: (p) => patch((s) => ({ ...s, settings: { ...s.settings, ...p } })),

      logAction,
    };
  }, [state, hydrated, patch, logAction]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}
