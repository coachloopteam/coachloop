"use client";

import { useState } from "react";
import { Check, Clock, Dumbbell, Flower2, PersonStanding, type LucideIcon } from "lucide-react";
import { DISCIPLINES, type Discipline } from "./mock-data";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

export default function WorkoutHub() {
  const [active, setActive] = useState<Discipline["id"]>("fitness");
  const [assigned, setAssigned] = useState<string | null>(null);

  const current = DISCIPLINES.find((d) => d.id === active)!;

  function assign(workoutId: string) {
    setAssigned(workoutId);
    window.setTimeout(() => setAssigned((cur) => (cur === workoutId ? null : cur)), 1800);
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">Workout &amp; Activity Hub</h2>
        <p className="mt-1 text-sm text-stone-500">Browse by discipline and assign a session in one tap.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {DISCIPLINES.map((d) => {
          const Icon = DISCIPLINE_ICON[d.id];
          const isActive = d.id === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300 ease-out",
                isActive
                  ? "border-transparent shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)] -translate-y-1"
                  : "border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-18px_rgba(0,0,0,0.16)]"
              )}
              style={isActive ? { background: d.gradient } : undefined}
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300",
                  isActive ? "bg-white/15 text-white" : "bg-stone-50 text-stone-700"
                )}
                aria-hidden
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className={cn("mt-4 text-lg font-semibold", isActive ? "text-white" : "text-stone-900")}>{d.name}</p>
              <p className={cn("mt-1 text-sm leading-relaxed", isActive ? "text-white/75" : "text-stone-500")}>
                {d.tagline}
              </p>
              <p className={cn("mt-4 text-xs font-medium uppercase tracking-wide", isActive ? "text-white/60" : "text-stone-400")}>
                {d.workouts.length} sessions
              </p>
            </button>
          );
        })}
      </div>

      <div
        key={current.id}
        className="animate-fade-in-up divide-y divide-stone-100 overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]"
      >
        {current.workouts.map((w) => (
          <div key={w.id} className="flex items-center justify-between gap-4 p-5 transition-colors duration-200 hover:bg-stone-50/70">
            <div className="min-w-0">
              <p className="font-medium text-stone-900">{w.title}</p>
              <p className="mt-0.5 text-sm text-stone-500">{w.detail}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-400">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {w.duration}
              </p>
            </div>
            <button
              onClick={() => assign(w.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97]",
                assigned === w.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-stone-900 text-white hover:bg-stone-800"
              )}
            >
              {assigned === w.id ? (
                <span className="animate-pop-in flex items-center gap-1.5">
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Assigned
                </span>
              ) : (
                "Assign"
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
