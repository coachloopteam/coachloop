"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { RECIPES, type Recipe } from "@/components/concept/mock-data";
import { cn } from "@/lib/cn";
import RecipeDetailModal from "./RecipeDetailModal";

// Suggestions with one real checkable action: "Mark as Eaten" awards
// illustrative XP (see MEAL_XP_REWARD) the same way a workout does — the
// rest of the card (photo, badges, tapping through to detail) stays
// informational only. Shares content with the Recipe Vault concept
// (components/concept/RecipeVault.tsx); see that file's note on schema.
// Nothing here saves or logs anything server-side.
export default function RecipeCarousel({ onLogMeal }: { onLogMeal: (recipeId: string) => void }) {
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());

  function logMeal(id: string) {
    if (loggedIds.has(id)) return;
    setLoggedIds((prev) => new Set(prev).add(id));
    onLogMeal(id);
  }

  return (
    <div>
      <h3 className="px-1 text-lg font-bold leading-snug text-stone-900">Today&apos;s Meal Ideas</h3>
      <p className="mt-1 px-1 text-sm text-stone-500">A few suggestions from your coach&apos;s recipe vault.</p>

      <div className="mt-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RECIPES.map((r) => {
          const isHighCal = r.category === "high-calorie";
          const logged = loggedIds.has(r.id);
          return (
            <div
              key={r.id}
              className="group w-[176px] shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_36px_-18px_rgba(0,0,0,0.2)]"
            >
              <button type="button" onClick={() => setSelected(r)} className="block w-full text-left">
                <div className="relative h-28 w-full overflow-hidden">
                  {r.image && (
                    <Image
                      src={r.image.src}
                      alt={r.image.alt}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" aria-hidden />
                  <span
                    className={cn(
                      "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md",
                      isHighCal ? "bg-[#f6ecd9]/90 text-[#8a6a2f]" : "bg-[#e7ede2]/90 text-[#4f6146]"
                    )}
                  >
                    {isHighCal ? "High-Calorie Boost" : "Nutrient-Dense"}
                  </span>
                </div>
                <div className="space-y-2 px-3.5 pt-3.5">
                  <p className="text-sm font-semibold leading-snug text-stone-900">{r.name}</p>
                  <p className="text-xs text-stone-400">{r.calories} kcal</p>
                  <div className="flex flex-wrap gap-1">
                    {r.glutenFree && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                        Gluten-Free
                      </span>
                    )}
                    {r.lactoseFree && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                        Lactose-Free
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <div className="p-3.5 pt-3">
                <button
                  type="button"
                  onClick={() => logMeal(r.id)}
                  disabled={logged}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all duration-500 ease-out active:scale-95 disabled:cursor-default",
                    logged ? "bg-emerald-50 text-emerald-700" : "bg-stone-900 text-white hover:bg-stone-800"
                  )}
                >
                  {logged ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      Logged
                    </>
                  ) : (
                    "Mark as Eaten"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <RecipeDetailModal recipe={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </div>
  );
}
