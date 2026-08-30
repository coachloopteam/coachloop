"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

type ChallengeWorkout = {
  id: string;
  title: string;
  discipline_type: string;
  detail: string | null;
};

// Real version of the client-dashboard concept's DailyChallenge — same
// tokenless-POST pattern as TodaysWorkouts.tsx, but posts the id of
// whichever workout app/c/[token]/page.tsx picked via
// lib/dailyChallenge.ts's pickDailyChallengeId(). The bonus XP is applied
// server-side in /api/daily-log (never trusted from here); this component
// just reflects it.
export default function DailyChallenge({
  token,
  workout,
  completed: initialCompleted,
}: {
  token: string;
  workout: ChallengeWorkout | null;
  completed: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);
  const router = useRouter();

  if (!workout) return null;

  async function handleComplete() {
    if (pending || completed) return;
    setPending(true);
    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, workoutId: workout!.id }),
    });
    setPending(false);
    if (res.ok || res.status === 409) {
      setCompleted(true);
      router.refresh();
    }
  }

  return (
    <div
      className={cn(
        "animate-fade-in-up rounded-3xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out",
        completed ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300",
            completed ? "bg-emerald-100 text-emerald-600" : "bg-[var(--accent-soft)] text-[var(--accent)]"
          )}
          aria-hidden
        >
          <Trophy className="h-4.5 w-4.5" strokeWidth={1.5} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Today&apos;s Challenge</p>
      </div>

      <p className="mt-3 text-lg font-bold leading-snug text-stone-900">{workout.title}</p>
      {workout.detail && <p className="mt-1 text-sm text-stone-500">{workout.detail}</p>}

      <button
        onClick={handleComplete}
        disabled={completed || pending}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-500 ease-out active:scale-[0.97] disabled:cursor-default",
          completed ? "bg-emerald-100 text-emerald-700" : "bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60"
        )}
      >
        {completed ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
            Challenge Completed
          </>
        ) : pending ? (
          "Logging…"
        ) : (
          "Complete Challenge (+35 XP)"
        )}
      </button>
    </div>
  );
}
