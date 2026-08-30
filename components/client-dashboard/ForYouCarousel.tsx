"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronRight, Play } from "lucide-react";
import { DISCIPLINES, RECIPES } from "@/components/concept/mock-data";
import { cn } from "@/lib/cn";
import RecipeDetailModal from "./RecipeDetailModal";
import type { Recipe } from "@/components/concept/mock-data";

// "Recommended for you" shelf — illustrative only, no real recommendation
// engine behind it. Reuses the same discipline/recipe content as the
// Workout Hub / Recipe Vault concept (components/concept/mock-data.ts).
export default function ForYouCarousel({ onStartWorkout }: { onStartWorkout: () => void }) {
  const [startedId, setStartedId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  function start(id: string) {
    if (startedId) return;
    setStartedId(id);
    onStartWorkout();
    window.setTimeout(() => setStartedId(null), 1800);
  }

  return (
    <div>
      <h2 className="px-1 text-lg font-bold tracking-tight text-stone-900">Recommended for Your Day</h2>
      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DISCIPLINES.map((d) => {
          const isStarted = startedId === d.id;
          return (
            <div
              key={d.id}
              className="group relative aspect-[3/4] w-36 shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl"
            >
              <Image src={d.image.src} alt={d.image.alt} fill sizes="144px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 transition-all duration-500 ease-out group-hover:from-black/95 group-hover:via-black/50" />
              <span className="absolute right-2 top-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                +20 XP
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{d.name}</p>
                <p className="mt-0.5 text-[13px] font-bold leading-snug text-white">{d.workouts[0].title}</p>
                <button
                  onClick={() => start(d.id)}
                  className={cn(
                    "mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-bold text-white backdrop-blur-md transition-all duration-500 ease-out active:scale-95",
                    isStarted ? "bg-emerald-500/90 opacity-100" : "bg-white/15 opacity-0 group-hover:opacity-100 group-hover:bg-white/25 sm:opacity-100 sm:bg-white/0"
                  )}
                >
                  {isStarted ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden /> Started
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" strokeWidth={2} fill="currentColor" aria-hidden /> Start Session
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {RECIPES.slice(0, 3).map((r) => {
          const isHighCal = r.category === "high-calorie";
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRecipe(r)}
              className="group relative aspect-[3/4] w-36 shrink-0 snap-start overflow-hidden rounded-2xl text-left transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl"
            >
              {r.image && (
                <Image src={r.image.src} alt={r.image.alt} fill sizes="144px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5 transition-all duration-500 ease-out group-hover:from-black/95 group-hover:via-black/55" />
              <span
                className={cn(
                  "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md",
                  isHighCal ? "bg-[#f6ecd9]/90 text-[#8a6a2f]" : "bg-[#e7ede2]/90 text-[#4f6146]"
                )}
              >
                {isHighCal ? "High-Calorie" : "Nutrient-Dense"}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[13px] font-bold leading-snug text-white">{r.name}</p>
                {r.macros && (
                  <p className="mt-1 text-[10px] font-medium text-white/70">
                    {r.macros.protein}g P · {r.macros.carbs}g C · {r.macros.fat}g F
                  </p>
                )}
                <span className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-full bg-white/15 py-2 text-[11px] font-bold text-white opacity-0 backdrop-blur-md transition-all duration-500 ease-out group-hover:opacity-100">
                  View Recipe
                  <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <RecipeDetailModal recipe={selectedRecipe} open={selectedRecipe !== null} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
}
