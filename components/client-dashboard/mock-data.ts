// Illustrative data only — this dashboard concept is a design blueprint, not
// wired to Supabase. Nothing in the current schema (supabase/schema.sql)
// models assigned daily tasks, disciplines, or recipe suggestions; clients
// today free-text log meals/workouts against `logs` (see
// components/LogButtons.tsx). Shapes below are what a future `daily_tasks`
// table could look like. Discipline and recipe content is shared with the
// Workout Hub / Recipe Vault concept — see components/concept/mock-data.ts.

import type { Discipline } from "@/components/concept/mock-data";

export type TaskStatus = "pending" | "done";

export type TaskType = "workout" | "checkin";

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  detail: string;
  status: TaskStatus;
  discipline?: Discipline["id"];
}

// Kept short on purpose — this is a single guided stream, not an exhaustive
// timeline. A couple of checkable moments, plus the recipe carousel woven in
// between them (rendered separately in DayStream, not a checkable task).
export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    type: "workout",
    title: "Today's Session",
    detail: "Reformer fundamentals — footwork, hundred, leg circles.",
    status: "pending",
    discipline: "pilates",
  },
  {
    id: "t2",
    type: "checkin",
    title: "Fill Out Your Daily Update",
    detail: "Tell your coach how today felt — energy, soreness, anything off.",
    status: "pending",
  },
];

export const MOCK_STREAK_DAYS = 3;
export const MOCK_TOTAL_CHECKINS = 47;

// Illustrative gamification numbers — there's no XP/level model in the
// schema. XP_PER_LEVEL is a flat threshold for the demo only.
export const MOCK_XP = 340;
export const XP_PER_LEVEL = 500;
export const TASK_XP_REWARD = 20;
export const WORKOUT_START_XP_REWARD = 20;
export const CHALLENGE_XP_REWARD = 35;
