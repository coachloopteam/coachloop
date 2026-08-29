"use client";

import { Flame, Leaf } from "lucide-react";
import { RECIPES } from "@/components/concept/mock-data";
import { cn } from "@/lib/cn";

// Suggestions only — informational, not a checkable task. Shares content
// with the Recipe Vault concept (components/concept/RecipeVault.tsx); see
// that file's note on schema. Nothing here saves or logs anything.
export default function RecipeCarousel() {
  return (
    <div>
      <h3 className="px-1 text-lg font-bold leading-snug text-stone-900">Today&apos;s Meal Ideas</h3>
      <p className="mt-1 px-1 text-sm text-stone-500">A few suggestions from your coach&apos;s recipe vault.</p>

      <div className="mt-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RECIPES.slice(0, 5).map((r) => {
          const isHighCal = r.category === "high-calorie";
          return (
            <div
              key={r.id}
              className="w-[168px] shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out active:scale-[0.97]"
            >
              <div
                className="flex h-20 items-center justify-center"
                style={{
                  background: isHighCal
                    ? "linear-gradient(135deg, #fde4c8, #fbb768)"
                    : "linear-gradient(135deg, #dcecd9, #9fc79a)",
                }}
                aria-hidden
              >
                {isHighCal ? (
                  <Flame className="h-6 w-6 text-amber-700/70" strokeWidth={1.25} />
                ) : (
                  <Leaf className="h-6 w-6 text-emerald-800/60" strokeWidth={1.25} />
                )}
              </div>
              <div className="space-y-2 p-3.5">
                <p className="text-sm font-semibold leading-snug text-stone-900">{r.name}</p>
                <p className="text-xs text-stone-400">{r.calories} kcal</p>
                <div className="flex flex-wrap gap-1">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isHighCal ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {isHighCal ? "High-Calorie" : "Nutrient-Rich"}
                  </span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
