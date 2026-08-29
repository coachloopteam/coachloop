"use client";

import { cn } from "@/lib/cn";
import type { Habit } from "./mock-data";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HabitRing({
  habits,
  onToggle,
}: {
  habits: Habit[];
  onToggle: (id: string) => void;
}) {
  const done = habits.filter((h) => h.status === "done").length;
  const progress = habits.length ? done / habits.length : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const complete = done === habits.length;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[200px] w-[200px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="#ff8a65" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#f1efec" strokeWidth="14" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-stone-900">
            {done}
            <span className="text-stone-300">/{habits.length}</span>
          </span>
          <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
            {complete ? "All done today" : "Habits today"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {habits.map((habit) => {
          const isDone = habit.status === "done";
          return (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              aria-pressed={isDone}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all duration-200 ease-out active:scale-90",
                  isDone ? "text-white shadow-md" : "bg-white text-stone-400 shadow-sm ring-1 ring-stone-200 hover:ring-stone-300"
                )}
                style={isDone ? { background: "linear-gradient(135deg, var(--accent), #ff8a65)" } : undefined}
              >
                {habit.emoji}
                {isDone && (
                  <span
                    key={`${habit.id}-check`}
                    className="animate-pop-in absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </span>
              <span className={cn("text-xs font-medium", isDone ? "text-stone-700" : "text-stone-400")}>
                {habit.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
