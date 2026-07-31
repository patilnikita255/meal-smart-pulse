import {
  BarChart3,
  Bell,
  CalendarDays,
  ChefHat,
  ClipboardList,
  CreditCard,
  FileBarChart,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/data/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const studentNav: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/student", icon: LayoutDashboard }],
  },
  {
    label: "Meals",
    items: [
      { label: "Meal Calendar", to: "/student/meal-calendar", icon: CalendarDays },
      { label: "Meal History", to: "/student/meal-history", icon: ClipboardList },
    ],
  },
  {
    label: "Subscription",
    items: [
      { label: "Available Plans", to: "/student/plans", icon: Package },
      { label: "My Subscription", to: "/student/subscription", icon: ListChecks },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Current Bill", to: "/student/bill", icon: Receipt },
      { label: "Payment History", to: "/student/payments", icon: Wallet },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Give Feedback", to: "/student/feedback", icon: MessageSquare },
      { label: "My Complaints", to: "/student/complaints", icon: ShieldCheck },
      { label: "Notifications", to: "/student/notifications", icon: Bell },
      { label: "Profile", to: "/student/profile", icon: User },
      { label: "Help", to: "/student/help", icon: HelpCircle },
    ],
  },
];

export const managerNav: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
      { label: "Today's Meals", to: "/manager/today", icon: UtensilsCrossed },
      { label: "Menu Management", to: "/manager/menu", icon: ChefHat },
      { label: "Meal Consumption", to: "/manager/consumption", icon: ClipboardList },
      { label: "Food Wastage", to: "/manager/wastage", icon: Trash2 },
    ],
  },
  {
    label: "People & Money",
    items: [
      { label: "Subscribers", to: "/manager/subscribers", icon: Users },
      { label: "Payments", to: "/manager/payments", icon: CreditCard },
      { label: "Feedback & Complaints", to: "/manager/feedback", icon: MessageSquare },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Smart Analytics", to: "/manager/analytics", icon: Sparkles },
      { label: "Reports", to: "/manager/reports", icon: FileBarChart },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", to: "/manager/notifications", icon: Bell },
      { label: "Profile", to: "/manager/profile", icon: User },
      { label: "Help", to: "/manager/help", icon: HelpCircle },
    ],
  },
];

export const adminNav: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Mess Managers", to: "/admin/managers", icon: ChefHat },
      { label: "Plans", to: "/admin/plans", icon: Package },
      { label: "Subscriptions", to: "/admin/subscriptions", icon: ListChecks },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", to: "/admin/reports", icon: FileBarChart },
      { label: "Feedback", to: "/admin/feedback", icon: MessageSquare },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", to: "/admin/settings", icon: Settings },
      { label: "Profile", to: "/admin/profile", icon: User },
      { label: "Help", to: "/admin/help", icon: HelpCircle },
    ],
  },
];

export const navByRole: Record<Role, NavGroup[]> = {
  student: studentNav,
  manager: managerNav,
  admin: adminNav,
};

export const roleLabel: Record<Role, string> = {
  student: "Student",
  manager: "Mess Manager",
  admin: "Administrator",
};

export const roleHome: Record<Role, string> = {
  student: "/student",
  manager: "/manager",
  admin: "/admin",
};
