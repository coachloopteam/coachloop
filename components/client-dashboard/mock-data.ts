// Illustrative data only — this dashboard concept is a design blueprint, not
// wired to Supabase. Nothing in the current schema (supabase/schema.sql)
// models habits, assigned tasks, or streaks; clients today free-text log
// meals/workouts against `logs` (see components/LogForm.tsx). Shapes below
// are what a future `habits`/`daily_tasks` table pair could look like.

export type HabitStatus = "pending" | "done";

export interface Habit {
  id: string;
  emoji: string;
  label: string;
  status: HabitStatus;
}

export type TimelineItemType = "workout" | "meal" | "habit" | "note";

export interface TimelineItem {
  id: string;
  time: string;
  period: "Morning" | "Midday" | "Evening";
  type: TimelineItemType;
  title: string;
  detail: string;
  status: HabitStatus;
}

export const MOCK_HABITS: Habit[] = [
  { id: "water", emoji: "💧", label: "Water", status: "done" },
  { id: "steps", emoji: "🚶", label: "Steps", status: "done" },
  { id: "protein", emoji: "🍗", label: "Protein", status: "pending" },
  { id: "sleep", emoji: "😴", label: "Sleep", status: "pending" },
  { id: "mobility", emoji: "🧘", label: "Mobility", status: "pending" },
];

export const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: "t1",
    time: "7:30 AM",
    period: "Morning",
    type: "meal",
    title: "Breakfast — protein + carbs",
    detail: "Eggs, oats, and a banana. Coach's note: keep it light before lifting.",
    status: "done",
  },
  {
    id: "t2",
    time: "8:15 AM",
    period: "Morning",
    type: "workout",
    title: "Upper body strength",
    detail: "Bench press 4x6, rows 4x8, overhead press 3x10.",
    status: "done",
  },
  {
    id: "t3",
    time: "12:30 PM",
    period: "Midday",
    type: "meal",
    title: "Lunch — hit your protein target",
    detail: "Aim for 40g+. Chicken, rice, and greens work well.",
    status: "pending",
  },
  {
    id: "t4",
    time: "3:00 PM",
    period: "Midday",
    type: "habit",
    title: "Mobility break",
    detail: "10 minutes — hips and shoulders, per your program.",
    status: "pending",
  },
  {
    id: "t5",
    time: "7:00 PM",
    period: "Evening",
    type: "note",
    title: "Evening check-in",
    detail: "Log how today felt — energy, soreness, anything off.",
    status: "pending",
  },
];

export const MOCK_STREAK_DAYS = 3;
