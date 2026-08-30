"use client";

import { useState } from "react";
import { ChevronDown, Dumbbell, Flower2, PersonStanding, Search, Sparkles, X, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import { cn } from "@/lib/cn";

type QueryKey = "coaches" | "pilates" | "dairy-free";

const CHIPS: { key: QueryKey; label: string }[] = [
  { key: "coaches", label: "Explore Top Coaches" },
  { key: "pilates", label: "Discover Pilates Protocols" },
  { key: "dairy-free", label: "Browse Dairy-Free Menus" },
];

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Coach specialties, not fabricated coach profiles — this app pairs each
// client with exactly one coach (see AGENTS.md / product model); there's no
// multi-coach marketplace to browse. Kept categorical on purpose.
const COACH_SPECIALTIES = [
  { name: "Strength & Conditioning", detail: "Progressive overload, compound lifts, deload cycles." },
  { name: "Mindful Movement", detail: "Pilates and yoga-led mobility and breathwork." },
  { name: "Performance Nutrition", detail: "Fueling strategy built around your training load." },
];

export default function SmartMatchSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<QueryKey | null>(null);

  function selectQuery(key: QueryKey) {
    setQuery((cur) => (cur === key ? null : key));
  }

  const pilates = DISCIPLINES.find((d) => d.id === "pilates")!;
  const dairyFree = RECIPES.filter((r) => r.lactoseFree).slice(0, 4);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-stone-50/70"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-400" aria-hidden>
          <Search className="h-4.5 w-4.5" strokeWidth={1.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-stone-900">Find Your Next Solution</span>
          <span className="block text-sm text-stone-500">A coach, a routine, or a nutrition goal</span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-stone-400 transition-transform duration-500 ease-out", open && "rotate-180")}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-500 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-stone-100 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => selectQuery(chip.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ease-out active:scale-95",
                    query === chip.key
                      ? "border-transparent bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {query && (
              <div className="animate-fade-in space-y-2">
                {query === "coaches" &&
                  COACH_SPECIALTIES.map((c) => (
                    <div key={c.name} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--accent)]" aria-hidden>
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-800">{c.name}</p>
                        <p className="truncate text-xs text-stone-500">{c.detail}</p>
                      </div>
                    </div>
                  ))}

                {query === "pilates" &&
                  pilates.workouts.map((w) => {
                    const Icon = DISCIPLINE_ICON.pilates;
                    return (
                      <div key={w.id} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: pilates.gradient }}
                          aria-hidden
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-800">{w.title}</p>
                          <p className="truncate text-xs text-stone-500">{w.detail}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-stone-400">{w.duration}</span>
                      </div>
                    );
                  })}

                {query === "dairy-free" &&
                  (dairyFree.length ? (
                    dairyFree.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7ede2] text-[#4f6146] text-[10px] font-bold" aria-hidden>
                          {r.calories}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-800">{r.name}</p>
                          <p className="truncate text-xs text-stone-500">Lactose-Free · {r.calories} kcal</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-1 text-sm text-stone-400">Nothing lactose-free on the menu yet.</p>
                  ))}
              </div>
            )}

            {query && (
              <button
                onClick={() => setQuery(null)}
                className="flex items-center gap-1 text-xs font-medium text-stone-400 transition-colors hover:text-stone-600"
              >
                <X className="h-3 w-3" strokeWidth={2} aria-hidden />
                Clear results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
