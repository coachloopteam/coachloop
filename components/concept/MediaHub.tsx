"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell, Flower2, PersonStanding, Play, type LucideIcon } from "lucide-react";
import { DISCIPLINES, type Discipline } from "./mock-data";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Standalone training archive concept — an image breakdown grid plus a
// media-player skeleton per discipline. There's no video hosting or
// streaming in this app yet, so the player below is a static placeholder,
// not a working embed. See components/concept/mock-data.ts for sourcing
// notes on the breakdown photos.
export default function MediaHub() {
  const [active, setActive] = useState<Discipline["id"]>("fitness");
  const current = DISCIPLINES.find((d) => d.id === active)!;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Instructional Media Hub</h2>
        <p className="mt-1 text-sm text-stone-500">Form breakdowns and guided sessions, organized by discipline.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DISCIPLINES.map((d) => {
          const Icon = DISCIPLINE_ICON[d.id];
          const isActive = d.id === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-500 ease-out",
                isActive
                  ? "border-transparent text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.4)]"
                  : "border-stone-200/80 bg-white text-stone-600 hover:border-stone-300"
              )}
              style={isActive ? { background: d.gradient } : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {d.name}
            </button>
          );
        })}
      </div>

      <div key={current.id} className="animate-fade-in-up space-y-8">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Form &amp; Alignment Breakdown</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {current.breakdown.map((b) => (
              <div
                key={b.id}
                className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_44px_-20px_rgba(0,0,0,0.22)]"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={b.image.src}
                    alt={b.image.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" aria-hidden />
                  <p className="absolute inset-x-0 bottom-0 p-4 text-base font-semibold leading-snug text-white">{b.title}</p>
                </div>
                <p className="p-4 text-sm leading-relaxed text-stone-500">{b.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Guided Session</h3>
          <div className="mt-4 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100/40 bg-gradient-to-br from-stone-50 to-stone-100/60 transition-all duration-500 ease-out">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md transition-transform duration-500 ease-out group-hover:scale-105"
              aria-hidden
            >
              <Play className="h-6 w-6" strokeWidth={1.5} fill="currentColor" />
            </span>
            <p className="text-sm font-medium text-stone-400">Video library coming soon — placeholder player</p>
          </div>
        </div>
      </div>
    </section>
  );
}
