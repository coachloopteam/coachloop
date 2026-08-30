"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell, Flower2, PersonStanding, Search, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import RevealOnScroll from "./RevealOnScroll";
import LivePreviewChat from "./LivePreviewChat";
import GuidedPreviewOverlay from "@/components/GuidedPreviewOverlay";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

type QueryKey = "fitness" | "pilates" | "yoga" | "meals";

const CHIPS: { key: QueryKey; label: string; icon: LucideIcon }[] = [
  { key: "fitness", label: "Elite Fitness Routines", icon: Dumbbell },
  { key: "pilates", label: "Pilates Sessions", icon: PersonStanding },
  { key: "yoga", label: "Yoga Flows", icon: Flower2 },
  { key: "meals", label: "Gourmet Meal Plans", icon: UtensilsCrossed },
];

// Real disciplines and real recipes (components/concept/mock-data.ts, same
// verified Unsplash photography used throughout the client-dashboard
// concept) presented as a capability showcase — not a live search over
// real user data, since nobody is signed in yet on a marketing page.
export default function TrendingSolutionHubs() {
  const [query, setQuery] = useState<QueryKey | null>(null);
  // Tap-to-toggle fallback for the Guided Preview overlay on touch devices
  // (which have no hover) — desktop reveals it via pure CSS group-hover.
  const [previewOpenId, setPreviewOpenId] = useState<string | null>(null);

  const activeDiscipline = query && query !== "meals" ? DISCIPLINES.find((d) => d.id === query) : null;

  return (
    <div id="trending" className="relative bg-stone-950 px-4 pb-24 pt-4 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Explore</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Trending Solution Hubs</h2>
        </RevealOnScroll>

        <RevealOnScroll delayMs={100}>
          <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DISCIPLINES.map((d) => {
              const Icon = DISCIPLINE_ICON[d.id];
              return (
                // A <div>, not a <button> — the Guided Preview overlay
                // inside has its own real button and range input, and
                // interactive controls can't nest inside a <button>.
                <div
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewOpenId((cur) => (cur === d.id ? null : d.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPreviewOpenId((cur) => (cur === d.id ? null : d.id));
                    }
                  }}
                  className="group relative aspect-[4/5] w-52 shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-slate-100/10 text-left shadow-2xl transition-all duration-700 ease-out hover:scale-[1.03]"
                >
                  <Image
                    src={d.image.src}
                    alt={d.image.alt}
                    fill
                    sizes="208px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white backdrop-blur-md"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <p className="mt-3 text-base font-semibold text-white">{d.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-white/60">{d.tagline}</p>
                  </div>

                  <GuidedPreviewOverlay title={d.name} note={d.tagline} open={previewOpenId === d.id} />
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={180} className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-slate-100/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60" aria-hidden>
                <Search className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-base font-semibold text-white">Find your next solution</p>
                <p className="text-sm text-white/40">A routine, a flow, or a meal plan — zero jargon, one tap.</p>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setQuery((cur) => (cur === chip.key ? null : chip.key))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-500 ease-out active:scale-95",
                      query === chip.key
                        ? "border-transparent bg-white text-stone-900"
                        : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                    )}
                  >
                    <chip.icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    {chip.label}
                  </button>
                ))}
              </div>

              {activeDiscipline && (
                <div className="animate-fade-in space-y-2">
                  {activeDiscipline.workouts.map((w) => (
                    <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{w.title}</p>
                        <p className="truncate text-xs text-white/40">{w.detail}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-white/30">{w.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {query === "meals" && (
                <div className="animate-fade-in space-y-2">
                  {RECIPES.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/70" aria-hidden>
                        {r.calories}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{r.name}</p>
                        <p className="truncate text-xs text-white/40">{r.calories} kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!query && <p className="px-1 py-2 text-sm text-white/30">Tap a category above to preview it.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                aria-hidden
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">Live client preview</p>
            </div>
            <LivePreviewChat />
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
