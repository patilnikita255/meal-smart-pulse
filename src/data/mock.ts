import {
  type AppNotification,
  type AppUser,
  type AuditLog,
  type Complaint,
  type ConsumptionRecord,
  type FeedbackEntry,
  type MealRecord,
  type MealType,
  type MenuEntry,
  type Payment,
  type Plan,
  type Subscription,
  type SystemSettings,
  MEAL_TYPES,
} from "./types";

/** Deterministic pseudo-random so SSR and client render identically. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const BASE_DATE = new Date("2026-07-31T00:00:00");

export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
export function todayISO() {
  return iso(BASE_DATE);
}
export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatMoney(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
export function weekdayName(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long" });
}

const STUDENT_NAMES = [
  "Aarav Sharma",
  "Diya Nair",
  "Rohan Iyer",
  "Sneha Kulkarni",
  "Kabir Menon",
  "Ananya Reddy",
  "Vivaan Joshi",
  "Ishita Banerjee",
  "Arjun Pillai",
  "Meera Deshpande",
  "Aditya Rao",
  "Tanvi Chauhan",
  "Nikhil Verma",
  "Pooja Mishra",
  "Harsh Patel",
  "Sanya Gupta",
  "Kunal Bhatt",
  "Riya Sen",
  "Devansh Shetty",
  "Neha Kapoor",
];

export const CURRENT_STUDENT_ID = "STU-001";

export const users: AppUser[] = [
  ...STUDENT_NAMES.map((name, i) => ({
    id: `STU-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().split(" ")[0]}.${name.toLowerCase().split(" ")[1]}@campus.edu.in`,
    contact: `+91 98${String(10000000 + Math.floor(rand(i + 3) * 8999999)).slice(0, 8)}`,
    role: "student" as const,
    status: i % 9 === 8 ? ("Inactive" as const) : ("Active" as const),
    joinedDate: iso(addDays(BASE_DATE, -(30 + i * 11))),
  })),
  {
    id: "MGR-001",
    name: "Lakshmi Venkatesh",
    email: "lakshmi.venkatesh@foodpulse.in",
    contact: "+91 9845012233",
    role: "manager",
    status: "Active",
    joinedDate: iso(addDays(BASE_DATE, -420)),
    assignedMess: "North Campus Mess",
  },
  {
    id: "MGR-002",
    name: "Satish Kumar",
    email: "satish.kumar@foodpulse.in",
    contact: "+91 9812345678",
    role: "manager",
    status: "Active",
    joinedDate: iso(addDays(BASE_DATE, -280)),
    assignedMess: "Hostel B Mess",
  },
  {
    id: "MGR-003",
    name: "Fatima Sheikh",
    email: "fatima.sheikh@foodpulse.in",
    contact: "+91 9900112233",
    role: "manager",
    status: "Inactive",
    joinedDate: iso(addDays(BASE_DATE, -150)),
    assignedMess: "PG Annexe Mess",
  },
  {
    id: "ADM-001",
    name: "Ravi Krishnan",
    email: "ravi.krishnan@foodpulse.in",
    contact: "+91 9820001122",
    role: "admin",
    status: "Active",
    joinedDate: iso(addDays(BASE_DATE, -600)),
  },
];

export const DEMO_ACCOUNTS: Record<"student" | "manager" | "admin", AppUser> = {
  student: users.find((u) => u.id === CURRENT_STUDENT_ID)!,
  manager: users.find((u) => u.id === "MGR-001")!,
  admin: users.find((u) => u.id === "ADM-001")!,
};

export const plans: Plan[] = [
  {
    id: "PLN-W1",
    name: "Weekly Plan",
    type: "Weekly",
    price: 850,
    durationDays: 7,
    meals: 21,
    includes: ["Breakfast", "Lunch", "Dinner"],
    description: "Short-term flexibility for students who travel home on weekends.",
    status: "Active",
  },
  {
    id: "PLN-M1",
    name: "Monthly Plan",
    type: "Monthly",
    price: 2700,
    durationDays: 30,
    meals: 90,
    includes: ["Breakfast", "Lunch", "Dinner"],
    description: "Best value for full-time hostellers. All three meals, every day.",
    status: "Active",
  },
  {
    id: "PLN-M2",
    name: "Monthly Lite",
    type: "Monthly",
    price: 1850,
    durationDays: 30,
    meals: 60,
    includes: ["Lunch", "Dinner"],
    description: "Lunch and dinner only — ideal for day scholars.",
    status: "Active",
  },
];

const MENU_BANK: Record<MealType, string[]> = {
  Breakfast: [
    "Idli, Sambar, Coconut Chutney, Filter Coffee",
    "Poha, Boiled Egg, Banana, Tea",
    "Aloo Paratha, Curd, Pickle, Masala Chai",
    "Upma, Groundnut Chutney, Fruit Bowl",
    "Masala Dosa, Sambar, Tomato Chutney",
    "Bread Toast, Omelette, Corn Flakes, Milk",
    "Puri Bhaji, Sooji Halwa, Tea",
  ],
  Lunch: [
    "Jeera Rice, Dal Tadka, Bhindi Masala, Chapati, Salad",
    "Veg Pulao, Rajma Masala, Curd, Papad",
    "Steamed Rice, Sambar, Cabbage Poriyal, Rasam",
    "Chapati, Paneer Butter Masala, Dal Fry, Rice",
    "Lemon Rice, Chana Masala, Beetroot Thoran, Buttermilk",
    "Rice, Egg Curry, Aloo Gobi, Chapati",
    "Veg Biryani, Mirchi Ka Salan, Raita, Gulab Jamun",
  ],
  Dinner: [
    "Chapati, Mixed Veg Curry, Dal, Rice, Kheer",
    "Fried Rice, Manchurian, Tomato Soup",
    "Roti, Chole, Jeera Rice, Salad",
    "Dosa, Sambar, Chutney, Fruit Custard",
    "Rice, Dal Palak, Aloo Matar, Chapati",
    "Khichdi, Kadhi, Papad, Pickle",
    "Paratha, Malai Kofta, Rice, Rasgulla",
  ],
};

export function menuFor(date: string, meal: MealType) {
  const day = new Date(date + "T00:00:00").getDay();
  return MENU_BANK[meal][day];
}

export const subscriptions: Subscription[] = STUDENT_NAMES.map((name, i) => {
  const student = users[i];
  const planPick = i % 3 === 0 ? plans[1] : i % 3 === 1 ? plans[0] : plans[2];
  const statusPool: Subscription["status"][] = [
    "Active",
    "Active",
    "Active",
    "Active",
    "Expired",
    "Paused",
    "Cancelled",
    "Pending",
  ];
  const status = i === 0 ? "Active" : statusPool[i % statusPool.length];
  const start = addDays(BASE_DATE, -(i % 20) - 10);
  return {
    id: `SUB-${String(i + 1).padStart(3, "0")}`,
    studentId: student.id,
    studentName: name,
    studentEmail: student.email,
    planId: planPick.id,
    planName: planPick.name,
    startDate: iso(start),
    endDate: iso(addDays(start, planPick.durationDays)),
    totalMeals: planPick.meals,
    usedMeals: i === 0 ? 42 : Math.floor(rand(i + 11) * planPick.meals),
    status,
    paymentStatus: i % 4 === 3 ? "Unpaid" : "Paid",
    requestStatus: null,
  };
});

export const CURRENT_SUBSCRIPTION_ID = "SUB-001";

/** 30 days of past meals + 7 upcoming days for the demo student. */
export const mealRecords: MealRecord[] = (() => {
  const out: MealRecord[] = [];
  for (let offset = -30; offset <= 7; offset++) {
    const date = iso(addDays(BASE_DATE, offset));
    MEAL_TYPES.forEach((meal, mi) => {
      const seed = offset * 3 + mi + 100;
      const skipped = rand(seed) > 0.82;
      out.push({
        id: `MR-${date}-${meal}`,
        studentId: CURRENT_STUDENT_ID,
        date,
        meal,
        menu: menuFor(date, meal),
        selection: skipped ? "Skipped" : "Selected",
        attendance: offset < 0 ? (skipped ? "Missed" : "Attended") : "Upcoming",
        rating: offset < 0 && !skipped ? 3 + Math.round(rand(seed + 7) * 2) : null,
        feedback: undefined,
      });
    });
  }
  return out;
})();

export const payments: Payment[] = subscriptions.flatMap((sub, i) => {
  const plan = plans.find((p) => p.id === sub.planId)!;
  const count = i % 3 === 0 ? 3 : 2;
  return Array.from({ length: count }, (_, k) => {
    const date = iso(addDays(BASE_DATE, -(k * 30 + (i % 12))));
    const adjustment = k === 0 && i % 5 === 0 ? -120 : 0;
    return {
      id: `PAY-${sub.studentId}-${k}`,
      invoice: `FP-2026-${String(i * 3 + k + 101).padStart(4, "0")}`,
      studentId: sub.studentId,
      studentName: sub.studentName,
      planName: plan.name,
      amount: plan.price + adjustment,
      baseAmount: plan.price,
      adjustment,
      date,
      status: k === 0 && i % 4 === 3 ? ("Unpaid" as const) : ("Paid" as const),
    };
  });
});

export const menus: MenuEntry[] = (() => {
  const out: MenuEntry[] = [];
  for (let offset = -3; offset <= 10; offset++) {
    const date = iso(addDays(BASE_DATE, offset));
    const dow = new Date(date + "T00:00:00").getDay();
    MEAL_TYPES.forEach((meal) => {
      out.push({
        id: `MENU-${date}-${meal}`,
        date,
        meal,
        items: menuFor(date, meal),
        special: dow === 0 && meal === "Lunch",
        festival: offset === 4 && meal === "Dinner",
        active: true,
      });
    });
  }
  return out;
})();

export const complaints: Complaint[] = [
  {
    id: "CMP-1041",
    studentId: "STU-001",
    studentName: "Aarav Sharma",
    date: iso(addDays(BASE_DATE, -2)),
    meal: "Dinner",
    category: "Food Quality",
    description: "The dal served at dinner was under-salted and served cold at the last counter.",
    status: "IN PROGRESS",
    response: "Noted. We have moved the dal to a heated counter from today.",
  },
  {
    id: "CMP-1038",
    studentId: "STU-001",
    studentName: "Aarav Sharma",
    date: iso(addDays(BASE_DATE, -9)),
    meal: "Breakfast",
    category: "Quantity",
    description: "Only two idlis were served per plate during the 8:30 AM rush.",
    status: "RESOLVED",
    response: "Portion size restored to three idlis and an extra batch is now prepared at 8:15 AM.",
  },
  {
    id: "CMP-1044",
    studentId: "STU-004",
    studentName: "Sneha Kulkarni",
    date: iso(addDays(BASE_DATE, -1)),
    meal: "Lunch",
    category: "Hygiene",
    description: "Water glasses near the wash area were not cleaned properly.",
    status: "OPEN",
  },
  {
    id: "CMP-1045",
    studentId: "STU-007",
    studentName: "Vivaan Joshi",
    date: iso(addDays(BASE_DATE, -1)),
    meal: "Dinner",
    category: "Suggestion",
    description: "Please add a millet-based option twice a week for students avoiding rice.",
    status: "OPEN",
  },
  {
    id: "CMP-1039",
    studentId: "STU-011",
    studentName: "Aditya Rao",
    date: iso(addDays(BASE_DATE, -6)),
    meal: "Lunch",
    category: "Service",
    description: "Counter closed five minutes before the scheduled lunch end time.",
    status: "RESOLVED",
    response: "Counter staff briefed; lunch now closes strictly at 2:00 PM.",
  },
];

export const feedback: FeedbackEntry[] = Array.from({ length: 24 }, (_, i) => {
  const student = users[i % 20];
  return {
    id: `FB-${i + 1}`,
    studentId: student.id,
    studentName: student.name,
    date: iso(addDays(BASE_DATE, -(i % 14) - 1)),
    meal: MEAL_TYPES[i % 3],
    rating: 3 + Math.round(rand(i + 21) * 2),
    comment: i % 4 === 0 ? "Good taste and served hot." : undefined,
  };
});

export const consumption: ConsumptionRecord[] = (() => {
  const out: ConsumptionRecord[] = [];
  for (let offset = -29; offset <= 0; offset++) {
    const date = iso(addDays(BASE_DATE, offset));
    const dow = new Date(date + "T00:00:00").getDay();
    const weekend = dow === 0 || dow === 6;
    MEAL_TYPES.forEach((meal, mi) => {
      const base = meal === "Breakfast" ? 250 : meal === "Lunch" ? 310 : 275;
      const weekendFactor = weekend ? (meal === "Dinner" ? 0.82 : 0.9) : 1;
      const expected = Math.round(base * weekendFactor + rand(offset * 5 + mi) * 18 - 9);
      const prepared = Math.round(expected * (1.06 + rand(offset + mi + 40) * 0.06));
      const consumed = Math.round(prepared * (0.86 + rand(offset + mi + 80) * 0.1));
      out.push({ id: `CON-${date}-${meal}`, date, meal, expected, prepared, consumed });
    });
  }
  return out;
})();

export const notifications: AppNotification[] = [
  {
    id: "N-1",
    role: "student",
    type: "warning",
    title: "Subscription expiring soon",
    message: "Your Monthly Plan expires in 3 days. Renew to avoid a break in meals.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "N-2",
    role: "student",
    type: "info",
    title: "Meal selection deadline approaching",
    message: "Confirm tomorrow's meals before 10:00 PM tonight.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "N-3",
    role: "student",
    type: "error",
    title: "Payment pending",
    message: "Invoice FP-2026-0104 of ₹2,700 is unpaid.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "N-4",
    role: "student",
    type: "success",
    title: "Menu updated",
    message: "Sunday lunch is now a special meal: Veg Biryani with Gulab Jamun.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "N-5",
    role: "student",
    type: "info",
    title: "Complaint update",
    message: "CMP-1041 moved to IN PROGRESS by the mess manager.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "N-6",
    role: "manager",
    type: "warning",
    title: "Wastage above target",
    message: "Sunday dinner wastage reached 16.4%, above the 10% target.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "N-7",
    role: "manager",
    type: "info",
    title: "New complaints received",
    message: "2 complaints are waiting for a first response.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "N-8",
    role: "manager",
    type: "error",
    title: "Pending payments",
    message: "5 subscribers have unpaid invoices this cycle.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "N-9",
    role: "admin",
    type: "success",
    title: "New mess manager added",
    message: "Satish Kumar was assigned to Hostel B Mess.",
    time: "4 hours ago",
    read: false,
  },
  {
    id: "N-10",
    role: "admin",
    type: "info",
    title: "Plan price updated",
    message: "Monthly Plan price changed from ₹2,500 to ₹2,700.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "N-11",
    role: "admin",
    type: "warning",
    title: "Inactive accounts",
    message: "3 student accounts have been inactive for over 60 days.",
    time: "2 days ago",
    read: true,
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-2051",
    timestamp: "2026-07-31 09:12",
    user: "Ravi Krishnan (Admin)",
    action: "Updated plan price",
    module: "Plans",
    description: "Monthly Plan price changed: ₹2,500 → ₹2,700",
    status: "Success",
  },
  {
    id: "LOG-2050",
    timestamp: "2026-07-31 08:47",
    user: "Ravi Krishnan (Admin)",
    action: "Changed payment status",
    module: "Payments",
    description: "Invoice FP-2026-0118 marked Unpaid → Paid",
    status: "Success",
  },
  {
    id: "LOG-2049",
    timestamp: "2026-07-30 18:05",
    user: "Lakshmi Venkatesh (Manager)",
    action: "Recorded consumption",
    module: "Meal Consumption",
    description: "Dinner 30 Jul: prepared 288, consumed 246",
    status: "Success",
  },
  {
    id: "LOG-2048",
    timestamp: "2026-07-30 16:22",
    user: "Ravi Krishnan (Admin)",
    action: "Deactivated user",
    module: "Users",
    description: "Student account STU-009 (Arjun Pillai) deactivated",
    status: "Success",
  },
  {
    id: "LOG-2047",
    timestamp: "2026-07-30 11:40",
    user: "Lakshmi Venkatesh (Manager)",
    action: "Updated menu",
    module: "Menu",
    description: "Lunch 02 Aug marked as Special Meal",
    status: "Success",
  },
  {
    id: "LOG-2046",
    timestamp: "2026-07-29 21:15",
    user: "System",
    action: "Meal cutoff applied",
    module: "Meals",
    description: "Selections locked for 30 Jul at 10:00 PM",
    status: "Success",
  },
  {
    id: "LOG-2045",
    timestamp: "2026-07-29 14:03",
    user: "Satish Kumar (Manager)",
    action: "Failed login attempt",
    module: "Authentication",
    description: "Incorrect password entered twice",
    status: "Failed",
  },
  {
    id: "LOG-2044",
    timestamp: "2026-07-29 10:31",
    user: "Ravi Krishnan (Admin)",
    action: "Added mess manager",
    module: "Mess Managers",
    description: "Fatima Sheikh assigned to PG Annexe Mess",
    status: "Success",
  },
  {
    id: "LOG-2043",
    timestamp: "2026-07-28 19:58",
    user: "Lakshmi Venkatesh (Manager)",
    action: "Resolved complaint",
    module: "Complaints",
    description: "CMP-1038 status IN PROGRESS → RESOLVED",
    status: "Success",
  },
  {
    id: "LOG-2042",
    timestamp: "2026-07-28 09:20",
    user: "Ravi Krishnan (Admin)",
    action: "Approved cancellation",
    module: "Subscriptions",
    description: "SUB-007 cancellation approved for Vivaan Joshi",
    status: "Success",
  },
];

export const defaultSettings: SystemSettings = {
  messName: "North Campus Mess",
  contact: "+91 98450 12233",
  address: "Block C, North Campus, Bengaluru 560064",
  operatingHours: "7:00 AM – 10:00 PM",
  breakfastTime: "7:30 AM – 9:30 AM",
  lunchTime: "12:30 PM – 2:00 PM",
  dinnerTime: "7:30 PM – 9:30 PM",
  cutoffTime: "10:00 PM previous day",
  notifySubscriptionExpiry: true,
  notifyPaymentReminder: true,
  notifyMealDeadline: true,
  notifyComplaintUpdate: true,
};

/** User growth / subscription / payment trend series for admin dashboards. */
export const monthlyTrends = [
  { month: "Feb", users: 82, subscriptions: 64, revenue: 148000, wastage: 14.2 },
  { month: "Mar", users: 106, subscriptions: 89, revenue: 196000, wastage: 13.4 },
  { month: "Apr", users: 138, subscriptions: 118, revenue: 244000, wastage: 12.8 },
  { month: "May", users: 171, subscriptions: 142, revenue: 289000, wastage: 11.9 },
  { month: "Jun", users: 208, subscriptions: 176, revenue: 341000, wastage: 10.7 },
  { month: "Jul", users: 246, subscriptions: 203, revenue: 402000, wastage: 9.6 },
];
