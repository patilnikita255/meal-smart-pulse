export type Role = "student" | "manager" | "admin";

export type MealType = "Breakfast" | "Lunch" | "Dinner";
export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];

export type MealSelection = "Selected" | "Skipped";
export type MealStatus = MealSelection | "Locked";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  contact: string;
  role: Role;
  status: "Active" | "Inactive";
  joinedDate: string;
  assignedMess?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: "Weekly" | "Monthly";
  price: number;
  durationDays: number;
  meals: number;
  includes: MealType[];
  description: string;
  status: "Active" | "Inactive";
}

export type SubscriptionStatus = "Active" | "Expired" | "Cancelled" | "Paused" | "Pending";

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  totalMeals: number;
  usedMeals: number;
  status: SubscriptionStatus;
  paymentStatus: "Paid" | "Unpaid";
  requestStatus?: "Cancellation Request Pending" | "Pause Request Pending" | null;
}

export interface MealRecord {
  id: string;
  studentId: string;
  date: string; // yyyy-MM-dd
  meal: MealType;
  menu: string;
  selection: MealSelection;
  attendance: "Attended" | "Missed" | "Upcoming";
  rating: number | null;
  feedback?: string;
}

export interface Payment {
  id: string;
  invoice: string;
  studentId: string;
  studentName: string;
  planName: string;
  amount: number;
  date: string;
  status: "Paid" | "Unpaid";
  baseAmount: number;
  adjustment: number;
}

export interface MenuEntry {
  id: string;
  date: string;
  meal: MealType;
  items: string;
  special: boolean;
  festival: boolean;
  active: boolean;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  meal: MealType;
  category: "Food Quality" | "Hygiene" | "Service" | "Quantity" | "Suggestion";
  description: string;
  status: "OPEN" | "IN PROGRESS" | "RESOLVED";
  response?: string;
}

export interface FeedbackEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  meal: MealType;
  rating: number;
  comment?: string;
}

export interface ConsumptionRecord {
  id: string;
  date: string;
  meal: MealType;
  expected: number;
  prepared: number;
  consumed: number;
}

export interface AppNotification {
  id: string;
  role: Role;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  description: string;
  status: "Success" | "Failed";
}

export interface SystemSettings {
  messName: string;
  contact: string;
  address: string;
  operatingHours: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  cutoffTime: string;
  notifySubscriptionExpiry: boolean;
  notifyPaymentReminder: boolean;
  notifyMealDeadline: boolean;
  notifyComplaintUpdate: boolean;
}
