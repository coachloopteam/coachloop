// Illustrative data only — this dashboard concept is a design blueprint, not
// wired to Supabase. Nothing in the current schema (supabase/schema.sql)
// models assigned daily tasks or streaks; clients today free-text log
// meals/workouts against `logs` (see components/LogButtons.tsx). Shapes below
// are what a future `daily_tasks` table could look like.

export type TaskStatus = "pending" | "done";

export type TaskType = "workout" | "meal" | "checkin";

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  detail: string;
  status: TaskStatus;
}

// Kept short on purpose — this is a single-focus stream, not an exhaustive
// timeline. Two or three big blocks, not a wall of them.
export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    type: "workout",
    title: "Today's Exercise",
    detail: "Upper body strength — bench press 4x6, rows 4x8, overhead press 3x10.",
    status: "pending",
  },
  {
    id: "t2",
    type: "meal",
    title: "Log Your Meals",
    detail: "Aim for 40g+ protein at lunch. Chicken, rice, and greens work well.",
    status: "pending",
  },
  {
    id: "t3",
    type: "checkin",
    title: "Fill Out Your Daily Update",
    detail: "Tell your coach how today felt — energy, soreness, anything off.",
    status: "pending",
  },
];

export const MOCK_STREAK_DAYS = 3;
export const MOCK_TOTAL_CHECKINS = 47;
