"use client";

import { useState } from "react";
import { ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { CHALLENGE_XP_REWARD } from "./mock-data";

export default function DailyChallenge({ onComplete }: { onComplete: (xp: number) => void }) {
  const [completed, setCompleted] = useState(false);

  function handleComplete() {
    if (completed) return;
    setCompleted(true);
    onComplete(CHALLENGE_XP_REWARD);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ease-out",
        completed
          ? "border-white/40 shadow-[0_20px_48px_-20px_rgba(0,0,0,0.2)] backdrop-blur-xl"
          : "border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]"
      )}
      style={
        completed
          ? { background: "linear-gradient(135deg, rgba(255,90,95,0.14), rgba(99,102,241,0.12))" }
          : undefined
      }
    >
      {!completed ? (
        <>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden>
              <Trophy className="h-4.5 w-4.5" strokeWidth={1.5} />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Today&apos;s Challenge</p>
          </div>
          <p className="mt-3 text-lg font-bold leading-snug text-stone-900">
            Complete a 10-minute Yoga flow to unlock your streak multiplier.
          </p>
          <button
            onClick={handleComplete}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3.5 text-sm font-bold text-white transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-stone-800 active:scale-[0.97]"
          >
            Complete Challenge
          </button>
        </>
      ) : (
        <div className="animate-scale-fade-in flex flex-col items-center py-2 text-center">
          <ShieldCheck className="h-10 w-10 text-[var(--accent)]" strokeWidth={1.25} aria-hidden />
          <p className="mt-3 text-lg font-bold text-stone-900">Challenge Completed</p>
          <p className="mt-1 text-sm text-stone-500">+{CHALLENGE_XP_REWARD} XP · Streak multiplier unlocked</p>
        </div>
      )}
    </div>
  );
}
