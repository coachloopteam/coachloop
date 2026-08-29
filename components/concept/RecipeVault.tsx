"use client";

import { useMemo, useState } from "react";
import { Flame, Leaf, MilkOff, WheatOff } from "lucide-react";
import { RECIPES, type Recipe } from "./mock-data";
import { cn } from "@/lib/cn";

type Category = "all" | Recipe["category"];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All Recipes" },
  { id: "high-calorie", label: "High-Calorie" },
  { id: "nutrient-rich", label: "Nutrient-Rich" },
];

export default function RecipeVault() {
  const [category, setCategory] = useState<Category>("all");
  const [glutenFree, setGlutenFree] = useState(false);
  const [lactoseFree, setLactoseFree] = useState(false);
  const [filterVersion, setFilterVersion] = useState(0);

  function updateFilters(next: () => void) {
    next();
    setFilterVersion((v) => v + 1);
  }

  const visible = useMemo(
    () =>
      RECIPES.filter(
        (r) =>
          (category === "all" || r.category === category) &&
          (!glutenFree || r.glutenFree) &&
          (!lactoseFree || r.lactoseFree)
      ),
    [category, glutenFree, lactoseFree]
  );

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">Healthy Recipes &amp; Nutrition Vault</h2>
        <p className="mt-1 text-sm text-stone-500">Filter by goal and dietary need — updates instantly.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5 rounded-full bg-stone-100 p-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilters(() => setCategory(c.id))}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                category === c.id ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters(() => setGlutenFree((v) => !v))}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              glutenFree
                ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-stone-200 text-stone-500 hover:border-stone-300"
            )}
          >
            <WheatOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Gluten-Free
          </button>
          <button
            onClick={() => updateFilters(() => setLactoseFree((v) => !v))}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              lactoseFree
                ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-stone-200 text-stone-500 hover:border-stone-300"
            )}
          >
            <MilkOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Lactose-Free
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => {
          const isHighCal = r.category === "high-calorie";
          return (
            <div
              key={`${filterVersion}-${r.id}`}
              className="animate-fade-in-up overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-18px_rgba(0,0,0,0.16)]"
            >
              <div
                className="flex h-28 items-center justify-center"
                style={{
                  background: isHighCal
                    ? "linear-gradient(135deg, #fde4c8, #fbb768)"
                    : "linear-gradient(135deg, #dcecd9, #9fc79a)",
                }}
                aria-hidden
              >
                {isHighCal ? (
                  <Flame className="h-9 w-9 text-amber-700/70" strokeWidth={1.25} />
                ) : (
                  <Leaf className="h-9 w-9 text-emerald-800/60" strokeWidth={1.25} />
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-stone-900">{r.name}</p>
                  <span className="shrink-0 text-xs font-medium text-stone-400">{r.calories} kcal</span>
                </div>
                <p className="text-sm leading-relaxed text-stone-500">{r.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      isHighCal ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {isHighCal ? "High-Calorie" : "Nutrient-Rich"}
                  </span>
                  {r.glutenFree && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600">
                      Gluten-Free
                    </span>
                  )}
                  {r.lactoseFree && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600">
                      Lactose-Free
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!visible.length && (
          <p className="col-span-full rounded-3xl border border-dashed border-stone-200 py-12 text-center text-sm text-stone-400">
            No recipes match those filters.
          </p>
        )}
      </div>
    </section>
  );
}
