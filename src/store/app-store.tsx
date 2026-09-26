import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addDays, BASE_DATE, iso, isPastCutoff, setCurrentStudentId, todayISO } from "@/data/mock";
import { createManagerAccount, demoSignIn } from "@/lib/demo-auth.functions";
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

// The generated DB types lag behind migrations; keep the data layer loosely typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const ROLE_FROM_DB: Record<string, Role> = { STUDENT: "student", MESS_MANAGER: "manager", ADMIN: "admin" };
const MEAL_TO_DB: Record<MealType, string> = { Breakfast: "BREAKFAST", Lunch: "LUNCH", Dinner: "DINNER" };
const MEAL_FROM_DB: Record<string, MealType> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", DINNER: "Dinner" };
const cap = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

const defaultSettings: SystemSettings = {
  messName: "FoodPulse",
  contact: "",
  address: "",
  operatingHours: "",
  breakfastTime: "",
  lunchTime: "",
  dinnerTime: "",
  cutoffTime: "22:00",
  notifySubscriptionExpiry: true,
  notifyPaymentReminder: true,
  notifyMealDeadline: true,
  notifyComplaintUpdate: true,
};

interface DataState {
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
  messes: { id: string; name: string }[];
  monthlyTrends: { month: string; users: number; subscriptions: number; revenue: number }[];
}

const emptyState: DataState = {
  role: null,
  currentUserId: null,
  users: [],
  plans: [],
  subscriptions: [],
  meals: [],
  payments: [],
  menus: [],
  complaints: [],
  feedback: [],
  consumption: [],
  notifications: [],
  auditLogs: [],
  settings: defaultSettings,
  messes: [],
  monthlyTrends: [],
};

interface AppStore extends DataState {
  hydrated: boolean;
  loadError: string | null;
  currentUser: AppUser | null;
  currentSubscription: Subscription | null;
  login: (role: Role) => Promise<void>;
  signIn: (email: string, password: string) => Promise<Role | null>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  resetDemoData: () => void;

  setMealSelection: (date: string, meal: MealType, selection: "Selected" | "Skipped") => Promise<boolean>;
  rateMeal: (id: string, rating: number, feedback?: string) => Promise<boolean>;
  isLocked: (date: string) => boolean;

  subscribeToPlan: (planId: string) => Promise<boolean>;
  requestSubscriptionChange: (kind: "pause" | "cancel") => Promise<boolean>;
  renewSubscription: () => Promise<boolean>;
  updateSubscription: (id: string, patch: Partial<Subscription>) => Promise<boolean>;

  upsertPlan: (plan: Plan) => Promise<boolean>;
  togglePlanStatus: (id: string) => Promise<boolean>;

  upsertUser: (user: AppUser) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;
  changePassword: (next: string) => Promise<boolean>;

  setPaymentStatus: (id: string, status: "Paid" | "Unpaid") => Promise<boolean>;

  upsertMenu: (entry: MenuEntry) => Promise<boolean>;
  deactivateMenu: (id: string) => Promise<boolean>;

  addComplaint: (c: Omit<Complaint, "id" | "status">) => Promise<boolean>;
  updateComplaint: (id: string, patch: Partial<Complaint>) => Promise<boolean>;
  addFeedback: (f: Omit<FeedbackEntry, "id">) => Promise<boolean>;

  saveConsumption: (record: Omit<ConsumptionRecord, "id">) => Promise<boolean>;

  markNotificationRead: (id: string) => Promise<boolean>;
  markAllRead: (role: Role) => Promise<boolean>;
  pushNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;

  updateSettings: (patch: Partial<SystemSettings>) => Promise<boolean>;
  logAction: (entry: Omit<AuditLog, "id" | "timestamp">) => void;
}

const Ctx = createContext<AppStore | null>(null);

function friendly(err: unknown): string {
  const msg = (err as { message?: string })?.message ?? "";
  if (!msg) return "Something went wrong. Please try again.";
  if (/duplicate key|unique/i.test(msg)) return "This record already exists.";
  if (/violates check constraint|invalid input/i.test(msg)) return "Some values are invalid. Please check and try again.";
  if (/permission denied|row-level security|JWT|Unauthorized/i.test(msg)) return "You are not allowed to do that.";
  if (/Failed to fetch|network/i.test(msg)) return "Unable to reach the server. Check your connection.";
  if (/relation|column|syntax|function .* does not exist/i.test(msg)) return "Unable to complete the request. Please try again.";
  return msg;
}

function relTime(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

async function q<T = Row[]>(p: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return (data ?? []) as T;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const idMaps = useRef({ sub: new Map<string, string>(), complaint: new Map<string, string>() });
  const session = useRef<{ uid: string; role: Role } | null>(null);

  const load = useCallback(async (uid: string, role: Role) => {
    setLoadError(null);
    try {
      await db.rpc("refresh_subscriptions");
      const today = todayISO();
      const from45 = iso(addDays(BASE_DATE, -45));
      const to7 = iso(addDays(BASE_DATE, 7));
      const isStaff = role !== "student";

      const [profiles, roles, managers, messes, plans, subs, pays, complaints, feedback, notes, settings, menus] = await Promise.all([
        q(db.from("profiles").select("*").order("created_at")),
        q(db.from("user_roles").select("user_id, role")),
        q(db.from("mess_managers").select("user_id, mess_id, status")),
        q(db.from("messes").select("id, name").order("name")),
        q(db.from("plans").select("*").order("price")),
        q(db.from("subscriptions").select("*").order("created_at", { ascending: false })),
        q(db.from("payments").select("*").order("payment_date", { ascending: false })),
        q(db.from("complaints").select("*").order("created_at", { ascending: false })),
        q(db.from("feedback").select("*, meals(meal_date, meal_type)").order("created_at", { ascending: false }).limit(1000)),
        q(db.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(100)),
        q(db.from("system_settings").select("*").is("mess_id", null).limit(1)),
        q(db.from("menus").select("*").gte("meal_date", from45).lte("meal_date", iso(addDays(BASE_DATE, 30))).order("meal_date")),
      ]);
      const [myMeals, demand, audit] = await Promise.all([
        role === "student" ? q(db.rpc("my_meals")) : Promise.resolve([] as Row[]),
        isStaff ? q(db.rpc("mess_demand", { p_from: from45, p_to: to7 })) : Promise.resolve([] as Row[]),
        role === "admin" ? q(db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500)) : Promise.resolve([] as Row[]),
      ]);

      const messName = new Map(messes.map((m) => [m.id, m.name]));
      const roleOf = new Map<string, Role>();
      roles.forEach((r) => {
        const cur = roleOf.get(r.user_id);
        const next = ROLE_FROM_DB[r.role]!;
        if (!cur || next === "admin" || (next === "manager" && cur === "student")) roleOf.set(r.user_id, next);
      });
      const messOfManager = new Map<string, string>();
      managers.filter((m) => m.status === "ACTIVE").forEach((m) => messOfManager.set(m.user_id, m.mess_id));
      const nameOf = new Map(profiles.map((p) => [p.id, p.full_name]));
      const emailOf = new Map(profiles.map((p) => [p.id, p.email]));

      const users: AppUser[] = profiles.map((p) => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        contact: p.phone ?? "",
        role: roleOf.get(p.id) ?? "student",
        status: p.status === "ACTIVE" ? "Active" : "Inactive",
        joinedDate: String(p.created_at).slice(0, 10),
        ...(messOfManager.has(p.id) ? { assignedMess: messName.get(messOfManager.get(p.id)!) ?? "" } : {}),
      }));

      const latestPay = new Map<string, Row>();
      pays.forEach((p) => {
        if (!latestPay.has(p.subscription_id)) latestPay.set(p.subscription_id, p);
      });
      idMaps.current.sub = new Map(subs.map((s) => [s.code, s.id]));
      const subscriptions: Subscription[] = subs.map((s) => ({
        id: s.code,
        studentId: s.student_id,
        studentName: nameOf.get(s.student_id) ?? "Student",
        studentEmail: emailOf.get(s.student_id) ?? "",
        planId: s.plan_id,
        planName: s.plan_name,
        startDate: s.start_date,
        endDate: s.end_date,
        totalMeals: s.total_meals,
        usedMeals: s.meals_used,
        status: cap(s.status) as Subscription["status"],
        paymentStatus: latestPay.get(s.id)?.status === "PAID" ? "Paid" : "Unpaid",
        requestStatus: s.cancellation_requested ? "Cancellation Request Pending" : s.pause_requested ? "Pause Request Pending" : null,
      }));
      const planOfSub = new Map(subs.map((s) => [s.id, s.plan_name]));

      const payments: Payment[] = pays.map((p) => ({
        id: p.id,
        invoice: p.invoice_number,
        studentId: p.student_id,
        studentName: nameOf.get(p.student_id) ?? "Student",
        planName: planOfSub.get(p.subscription_id) ?? "",
        amount: Number(p.amount),
        date: p.payment_date,
        status: (p.status === "PAID" ? "Paid" : p.status === "UNPAID" ? "Unpaid" : cap(p.status)) as Payment["status"],
        baseAmount: Number(p.base_amount),
        adjustment: Number(p.adjustment),
      }));

      idMaps.current.complaint = new Map(complaints.map((c) => [c.code, c.id]));
      const complaintList: Complaint[] = complaints.map((c) => ({
        id: c.code,
        studentId: c.student_id,
        studentName: nameOf.get(c.student_id) ?? "Student",
        date: c.complaint_date,
        meal: MEAL_FROM_DB[c.meal_type]!,
        category: c.category,
        description: c.description,
        status: c.status === "IN_PROGRESS" ? "IN PROGRESS" : c.status,
        ...(c.manager_response ? { response: c.manager_response } : {}),
      }));

      const feedbackList: FeedbackEntry[] = feedback
        .filter((f) => f.meals)
        .map((f) => ({
          id: f.id,
          studentId: f.student_id,
          studentName: nameOf.get(f.student_id) ?? "Student",
          date: f.meals.meal_date,
          meal: MEAL_FROM_DB[f.meals.meal_type]!,
          rating: f.rating,
          ...(f.description ? { comment: f.description } : {}),
        }));

      const meals: MealRecord[] = myMeals.map((m) => ({
        id: `${m.meal_date}|${MEAL_FROM_DB[m.meal_type]}`,
        studentId: uid,
        date: m.meal_date,
        meal: MEAL_FROM_DB[m.meal_type]!,
        menu: m.menu,
        selection: m.status === "SKIPPED" ? "Skipped" : "Selected",
        attendance: m.served ? (m.status === "SKIPPED" ? "Missed" : "Attended") : "Upcoming",
        rating: m.rating ?? null,
        ...(m.comment ? { feedback: m.comment } : {}),
      }));

      const consumption: ConsumptionRecord[] = demand
        .filter((d) => d.has_record || (d.meal_date >= today && d.meal_date <= to7))
        .map((d) => ({
          id: `${d.meal_date}|${d.meal_type}`,
          date: d.meal_date,
          meal: MEAL_FROM_DB[d.meal_type]!,
          expected: d.expected,
          prepared: d.prepared,
          consumed: d.consumed,
        }));

      const s0 = settings[0];
      const sysSettings: SystemSettings = s0
        ? {
            messName: s0.mess_name,
            contact: s0.contact,
            address: s0.address,
            operatingHours: s0.operating_hours,
            breakfastTime: s0.breakfast_time,
            lunchTime: s0.lunch_time,
            dinnerTime: s0.dinner_time,
            cutoffTime: String(s0.cutoff_time).slice(0, 5),
            notifySubscriptionExpiry: s0.notify_subscription_expiry,
            notifyPaymentReminder: s0.notify_payment_reminder,
            notifyMealDeadline: s0.notify_meal_deadline,
            notifyComplaintUpdate: s0.notify_complaint_update,
          }
        : defaultSettings;

      // Monthly trends (last 6 months) from real users, subscriptions and paid invoices.
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth() - 5 + i, 1);
        return { key: iso(d).slice(0, 7), month: d.toLocaleDateString("en-IN", { month: "short" }) };
      });
      const monthlyTrends = months.map(({ key, month }) => {
        const end = key + "-31";
        return {
          month,
          users: users.filter((u) => u.joinedDate.slice(0, 7) <= key).length,
          subscriptions: subs.filter((s) => s.start_date <= end && s.end_date >= key + "-01" && s.status !== "CANCELLED" && s.status !== "PENDING").length,
          revenue: pays.filter((p) => p.status === "PAID" && String(p.payment_date).slice(0, 7) === key).reduce((a, p) => a + Number(p.amount), 0),
        };
      });

      setCurrentStudentId(role === "student" ? uid : "");
      setState({
        role,
        currentUserId: uid,
        users,
        plans: plans.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type === "WEEKLY" ? "Weekly" : "Monthly",
          price: Number(p.price),
          durationDays: p.duration_days,
          meals: p.included_meals,
          includes: [p.breakfast_included && "Breakfast", p.lunch_included && "Lunch", p.dinner_included && "Dinner"].filter(Boolean) as MealType[],
          description: p.description,
          status: p.status === "ACTIVE" ? "Active" : "Inactive",
        })),
        subscriptions,
        meals,
        payments,
        menus: menus.map((m) => ({
          id: m.id,
          date: m.meal_date,
          meal: MEAL_FROM_DB[m.meal_type]!,
          items: m.menu_items,
          special: m.is_special,
          festival: m.is_festival,
          active: m.status === "ACTIVE",
        })),
        complaints: complaintList,
        feedback: feedbackList,
        consumption,
        notifications: notes.map((n) => ({
          id: n.id,
          role,
          type: n.type.toLowerCase(),
          title: n.title,
          message: n.message,
          time: relTime(n.created_at),
          read: n.is_read,
        })),
        auditLogs: audit.map((a) => ({
          id: a.id,
          timestamp: new Date(a.created_at).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
          user: a.actor_name,
          action: a.action,
          module: a.module,
          description: a.description,
          status: a.status,
        })),
        settings: sysSettings,
        messes: messes.map((m) => ({ id: m.id, name: m.name })),
        monthlyTrends,
      });
    } catch (e) {
      console.error(e);
      setLoadError("Unable to load data. Please try again.");
      toast.error("Unable to load data. Please try again.");
    }
  }, []);

  // Resolve the auth session → profile → role → data.
  const resolveSession = useCallback(
    async (uid: string | null) => {
      if (!uid) {
        session.current = null;
        setCurrentStudentId("");
        setState(emptyState);
        setHydrated(true);
        return;
      }
      const { data: dbRole, error } = await db.rpc("ensure_my_profile");
      if (error) {
        setLoadError("Unable to load your profile.");
        setHydrated(true);
        return;
      }
      const { data: prof } = await db.from("profiles").select("status").eq("id", uid).single();
      if (prof && prof.status !== "ACTIVE") {
        toast.error("Your account is not active. Please contact the administrator.");
        await supabase.auth.signOut();
        return;
      }
      const role = ROLE_FROM_DB[dbRole as string] ?? "student";
      session.current = { uid, role };
      await load(uid, role);
      setHydrated(true);
    },
    [load],
  );

  useEffect(() => {
    let lastUid: string | null | undefined;
    supabase.auth.getSession().then(({ data }) => {
      lastUid = data.session?.user.id ?? null;
      void resolveSession(lastUid);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const uid = s?.user.id ?? null;
      if (uid === lastUid) return;
      lastUid = uid;
      setTimeout(() => void resolveSession(uid), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [resolveSession]);

  const reload = useCallback(async () => {
    if (session.current) await load(session.current.uid, session.current.role);
  }, [load]);

  // Realtime: notifications, complaints, payments and menus refresh the view.
  useEffect(() => {
    if (!state.currentUserId) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const bump = () => {
      clearTimeout(t);
      t = setTimeout(() => void reload(), 600);
    };
    const ch = supabase
      .channel(`fp-live-${state.currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${state.currentUserId}` }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "menus" }, bump)
      .subscribe();
    return () => {
      clearTimeout(t);
      void supabase.removeChannel(ch);
    };
  }, [state.currentUserId, reload]);

  /** Runs a backend mutation; on failure removes any optimistic success toast and shows the reason. */
  const run = useCallback(
    async (fn: () => PromiseLike<{ error: unknown }> | Promise<unknown>): Promise<boolean> => {
      try {
        const res = (await fn()) as { error?: unknown } | undefined;
        if (res && typeof res === "object" && "error" in res && res.error) throw res.error;
        await reload();
        return true;
      } catch (e) {
        toast.dismiss();
        toast.error(friendly(e));
        return false;
      }
    },
    [reload],
  );

  const value = useMemo<AppStore>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
    const mySubs = state.subscriptions.filter((s) => s.studentId === state.currentUserId);
    const currentSubscription =
      state.role === "student"
        ? (mySubs.find((s) => s.status === "Active") ?? mySubs.find((s) => s.status !== "Cancelled") ?? mySubs[0] ?? null)
        : null;
    const subUuid = (code: string) => idMaps.current.sub.get(code) ?? code;
    const complaintUuid = (code: string) => idMaps.current.complaint.get(code) ?? code;

    return {
      ...state,
      hydrated,
      loadError,
      currentUser,
      currentSubscription,
      reload,
      resetDemoData: () => void reload(),

      login: async (role) => {
        try {
          const res = await demoSignIn({ data: { role } });
          const { error } = await supabase.auth.verifyOtp({ token_hash: res.tokenHash, type: "magiclink" });
          if (error) throw error;
        } catch (e) {
          toast.dismiss();
          toast.error(friendly(e));
          throw e;
        }
      },
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(/invalid/i.test(error.message) ? "Invalid email or password." : friendly(error));
        const { data: r } = await db.rpc("ensure_my_profile");
        return data.user ? (ROLE_FROM_DB[r as string] ?? "student") : null;
      },
      logout: async () => {
        await supabase.auth.signOut();
      },

      isLocked: (date) => isPastCutoff(date, state.settings.cutoffTime),

      setMealSelection: (date, meal, selection) =>
        run(() => db.rpc("set_meal_selection", { p_meal_date: date, p_meal_type: MEAL_TO_DB[meal], p_status: selection === "Skipped" ? "SKIPPED" : "SELECTED" })),

      rateMeal: (id, rating, fb) => {
        const [date, meal] = id.split("|") as [string, MealType];
        return run(() => db.rpc("submit_feedback", { p_meal_date: date, p_meal_type: MEAL_TO_DB[meal], p_rating: rating, p_comment: fb ?? null }));
      },

      subscribeToPlan: (planId) => run(() => db.rpc("subscribe_to_plan", { p_plan_id: planId })),
      requestSubscriptionChange: (kind) => run(() => db.rpc("request_subscription_change", { p_kind: kind })),
      renewSubscription: () => run(() => db.rpc("renew_subscription")),
      updateSubscription: (id, p) =>
        run(() =>
          db.rpc("manage_subscription", {
            p_id: subUuid(id),
            p_status: p.status ? p.status.toUpperCase() : null,
            p_clear_requests: p.requestStatus === null || p.status !== undefined,
          }),
        ),

      upsertPlan: (plan) =>
        run(() =>
          db.rpc("upsert_plan", {
            p_id: state.plans.some((p) => p.id === plan.id) ? plan.id : null,
            p_name: plan.name,
            p_type: plan.type.toUpperCase(),
            p_price: plan.price,
            p_duration: plan.durationDays,
            p_meals: plan.meals,
            p_breakfast: plan.includes.includes("Breakfast"),
            p_lunch: plan.includes.includes("Lunch"),
            p_dinner: plan.includes.includes("Dinner"),
            p_description: plan.description,
            p_status: plan.status.toUpperCase(),
          }),
        ),
      togglePlanStatus: (id) => {
        const plan = state.plans.find((p) => p.id === id);
        if (!plan) return Promise.resolve(false);
        return value.upsertPlan({ ...plan, status: plan.status === "Active" ? "Inactive" : "Active" });
      },

      upsertUser: (user) => {
        const existing = state.users.find((u) => u.id === user.id);
        const messId = state.messes.find((m) => m.name === user.assignedMess)?.id ?? null;
        if (existing && user.id === state.currentUserId && state.role !== "admin") {
          return run(() => db.rpc("update_my_profile", { p_full_name: user.name, p_phone: user.contact }));
        }
        if (existing) {
          return run(() =>
            db.rpc("admin_update_user", {
              p_id: user.id,
              p_full_name: user.name,
              p_phone: user.contact,
              p_status: user.status === "Active" ? "ACTIVE" : "INACTIVE",
              p_mess: messId,
            }),
          );
        }
        if (user.role === "manager") {
          return run(() =>
            createManagerAccount({ data: { fullName: user.name, email: user.email, phone: user.contact || undefined, ...(messId ? { messId } : {}) } }),
          );
        }
        toast.dismiss();
        toast.error("Students create their own accounts from the registration page.");
        return Promise.resolve(false);
      },
      toggleUserStatus: (id) => {
        const u = state.users.find((x) => x.id === id);
        if (!u) return Promise.resolve(false);
        return value.upsertUser({ ...u, status: u.status === "Active" ? "Inactive" : "Active" });
      },
      changePassword: (next) => run(() => supabase.auth.updateUser({ password: next })),

      setPaymentStatus: (id, status) => run(() => db.rpc("update_payment_status", { p_id: id, p_status: status.toUpperCase() })),

      upsertMenu: (entry) =>
        run(() =>
          db.rpc("upsert_menu", {
            p_id: state.menus.some((m) => m.id === entry.id) ? entry.id : null,
            p_date: entry.date,
            p_meal_type: MEAL_TO_DB[entry.meal],
            p_items: entry.items,
            p_special: entry.special,
            p_festival: entry.festival,
            p_active: entry.active,
          }),
        ),
      deactivateMenu: (id) => {
        const m = state.menus.find((x) => x.id === id);
        if (!m) return Promise.resolve(false);
        return value.upsertMenu({ ...m, active: false });
      },

      addComplaint: (c) =>
        run(() =>
          db.rpc("submit_complaint", { p_date: c.date, p_meal_type: MEAL_TO_DB[c.meal], p_category: c.category, p_description: c.description }),
        ),
      updateComplaint: (id, p) =>
        run(() =>
          db.rpc("update_complaint", {
            p_id: complaintUuid(id),
            p_status: p.status ? p.status.replace(" ", "_") : (state.complaints.find((c) => c.id === id)?.status ?? "OPEN").replace(" ", "_"),
            p_response: p.response ?? null,
          }),
        ),
      addFeedback: (f) =>
        run(() => db.rpc("submit_feedback", { p_meal_date: f.date, p_meal_type: MEAL_TO_DB[f.meal], p_rating: f.rating, p_comment: f.comment ?? null })),

      saveConsumption: (r) =>
        run(() => db.rpc("save_consumption", { p_date: r.date, p_meal_type: MEAL_TO_DB[r.meal], p_prepared: r.prepared, p_consumed: r.consumed })),

      markNotificationRead: (id) => run(() => db.from("notifications").update({ is_read: true }).eq("id", id)),
      markAllRead: () =>
        run(() => db.from("notifications").update({ is_read: true }).eq("user_id", state.currentUserId).eq("is_read", false)),
      // Notifications and audit entries are now written by the backend as part of each operation.
      pushNotification: () => {},
      logAction: () => {},

      updateSettings: (p) => run(() => db.rpc("update_settings", { p: { ...state.settings, ...p } })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hydrated, loadError, run, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}
