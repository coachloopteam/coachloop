"use client";

import { Flame } from "lucide-react";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function MobileHeader({
  name,
  tasksLeft,
  streak,
  xp,
  xpGoal,
  level,
}: {
  name: string;
  tasksLeft: number;
  streak: number;
  xp: number;
  xpGoal: number;
  level: number;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  const xpIntoLevel = xp % xpGoal;
  const pct = Math.min(100, Math.round((xpIntoLevel / xpGoal) * 100));

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-3.5 px-5 py-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-stone-900">
            {timeOfDayGreeting()}, {name}
          </p>
          <p className="text-sm text-stone-500">
            {tasksLeft === 0 ? "All caught up for today" : `${tasksLeft} task${tasksLeft === 1 ? "" : "s"} left today`}
          </p>
        </div>

        <div
          className="group flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 transition-all duration-500 ease-out hover:scale-105 hover:bg-amber-100"
          title={`${streak}-day active streak`}
        >
          <Flame
            className="animate-fade-in h-5 w-5 fill-amber-400 text-amber-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="text-sm font-bold text-amber-700">{streak}</span>
        </div>
      </div>

      <div className="px-5 pb-3.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400">
          <span>Level {level}</span>
          <span>
            {xpIntoLevel} / {xpGoal} XP
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4338ca, #64748b)" }}
          />
        </div>
      </div>
    </header>
  );
}
