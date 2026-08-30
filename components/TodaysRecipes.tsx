"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  calories: number | null;
  high_calorie: boolean;
  nutrient_dense: boolean;
  gluten_free: boolean;
  lactose_free: boolean;
};

// Same tokenless-POST pattern as TodaysWorkouts.tsx, but recipes always
// earn 0 XP server-side (see WORKOUT_XP_REWARD in app/api/daily-log) —
// logging one still counts toward the day's streak/check-in via the same
// trigger, it just isn't a scoring event. Matches the existing
// RecipeCarousel/RecipeDetailModal badge wording ("High-Calorie Boost",
// "Nutrient-Dense") for consistency with the client-dashboard concept.
//
// NOTE: unlike workouts, daily_logs has no unique constraint on
// (client_id, recipe_id, log_date) — logging the same recipe twice creates
// two rows. Harmless at 0 XP, but the client-side "already logged" guard
// below is the only thing preventing duplicates right now.
export default function TodaysRecipes({
  token,
  recipes,
  loggedRecipeIds,
}: {
  token: string;
  recipes: Recipe[];
  loggedRecipeIds: string[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [logged, setLogged] = useState(new Set(loggedRecipeIds));
  const router = useRouter();

  async function logRecipe(recipeId: string) {
    if (pendingId || logged.has(recipeId)) return;
    setPendingId(recipeId);
    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, recipeId }),
    });
    setPendingId(null);
    if (res.ok) {
      setLogged((prev) => new Set(prev).add(recipeId));
      router.refresh();
    }
  }

  if (!recipes.length) return null;

  return (
    <div className="animate-fade-in-up space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-400">Today&apos;s Meal Ideas</h2>
      {recipes.map((r) => {
        const isDone = logged.has(r.id);
        return (
          <div
            key={r.id}
            className={cn(
              "rounded-3xl border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out",
              isDone ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-900">{r.title}</p>
                {r.description && <p className="mt-0.5 text-sm text-stone-500">{r.description}</p>}
                {r.calories != null && <p className="mt-1 text-xs text-stone-400">{r.calories} kcal</p>}
              </div>
              <button
                onClick={() => logRecipe(r.id)}
                disabled={isDone || pendingId === r.id}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-default",
                  isDone ? "bg-emerald-100 text-emerald-700" : "bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-60"
                )}
              >
                {isDone ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Made it
                  </span>
                ) : pendingId === r.id ? (
                  "Logging…"
                ) : (
                  "I Made This"
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.high_calorie && (
                <span className="rounded-full bg-[#f6ecd9] px-2.5 py-1 text-xs font-semibold text-[#8a6a2f]">
                  High-Calorie Boost
                </span>
              )}
              {r.nutrient_dense && (
                <span className="rounded-full bg-[#e7ede2] px-2.5 py-1 text-xs font-semibold text-[#4f6146]">
                  Nutrient-Dense
                </span>
              )}
              {r.gluten_free && (
                <span className="rounded-full bg-[#efece7] px-2.5 py-1 text-xs font-semibold text-[#5c564c]">
                  Gluten-Free
                </span>
              )}
              {r.lactose_free && (
                <span className="rounded-full bg-[#efece7] px-2.5 py-1 text-xs font-semibold text-[#5c564c]">
                  Lactose-Free
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
