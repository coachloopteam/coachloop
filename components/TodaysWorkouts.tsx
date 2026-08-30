"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Dumbbell, Flower2, PersonStanding, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Workout = {
  id: string;
  title: string;
  discipline_type: "fitness" | "pilates" | "yoga";
  detail: string | null;
  duration_minutes: number | null;
};

const DISCIPLINE_ICON: Record<Workout["discipline_type"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Real, tokenless logging — same pattern as LogButtons.tsx, but posts to
// /api/daily-log instead of /api/log, which drives the streak/XP trigger
// on client_gamification. router.refresh() re-fetches the streak/XP shown
// above this component in app/c/[token]/page.tsx, so there's no separate
// client-side XP state to keep in sync.
export default function TodaysWorkouts({
  token,
  workouts,
  completedWorkoutIds,
}: {
  token: string;
  workouts: Workout[];
  completedWorkoutIds: string[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(new Set(completedWorkoutIds));
  const router = useRouter();

  async function logWorkout(workoutId: string) {
    if (pendingId || completed.has(workoutId)) return;
    setPendingId(workoutId);
    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, workoutId }),
    });
    setPendingId(null);
    // A 409 just means it was already logged today (e.g. a second tab beat
    // us to it) — either way it's logged, so reflect that instead of erroring.
    if (res.ok || res.status === 409) {
      setCompleted((prev) => new Set(prev).add(workoutId));
      router.refresh();
    }
  }

  if (!workouts.length) return null;

  return (
    <div className="animate-fade-in-up space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-400">Today&apos;s Workouts</h2>
      {workouts.map((w) => {
        const Icon = DISCIPLINE_ICON[w.discipline_type];
        const isDone = completed.has(w.id);
        return (
          <div
            key={w.id}
            className={cn(
              "flex items-center gap-4 rounded-3xl border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out",
              isDone ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white"
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
                isDone ? "bg-emerald-100 text-emerald-600" : "bg-stone-50 text-stone-700"
              )}
              aria-hidden
            >
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{w.discipline_type}</p>
              <p className="text-base font-semibold text-stone-900">{w.title}</p>
              {w.detail && <p className="mt-0.5 text-sm text-stone-500">{w.detail}</p>}
              {w.duration_minutes && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-stone-400">
                  <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                  {w.duration_minutes} min
                </p>
              )}
            </div>
            <button
              onClick={() => logWorkout(w.id)}
              disabled={isDone || pendingId === w.id}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-default",
                isDone ? "bg-emerald-100 text-emerald-700" : "bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60"
              )}
            >
              {isDone ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Done
                </span>
              ) : pendingId === w.id ? (
                "Logging…"
              ) : (
                "Complete"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
