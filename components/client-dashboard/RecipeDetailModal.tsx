"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Clock, Flame, Heart, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Recipe } from "@/components/concept/mock-data";

type RecipeDetail = { prepTime: string; servings: string; steps: string[] };

// Illustrative prep content — this concept's recipe data (name, description,
// calories, tags) is real to the mock-data model, but step-by-step
// instructions aren't part of it yet. Written to match each recipe's actual
// listed ingredients. See components/concept/mock-data.ts.
const RECIPE_DETAILS: Record<string, RecipeDetail> = {
  r1: {
    prepTime: "10 min",
    servings: "1 serving",
    steps: [
      "Bring the oats and milk to a gentle simmer, stirring occasionally.",
      "Cook until creamy, about 5 minutes.",
      "Slice the banana and stir it in with a swirl of peanut butter.",
      "Drizzle with honey and serve warm.",
    ],
  },
  r2: {
    prepTime: "25 min",
    servings: "2 servings",
    steps: [
      "Rinse the quinoa and simmer until fluffy, about 15 minutes.",
      "Season the salmon and grill 4–5 minutes per side.",
      "Roast the broccoli until lightly charred.",
      "Plate together and finish with the lemon-olive oil dressing.",
    ],
  },
  r3: {
    prepTime: "20 min",
    servings: "2 servings",
    steps: [
      "Dice the sweet potato and cook in a hot skillet until tender.",
      "Add the ground beef and cook through.",
      "Stir in the spinach until just wilted.",
      "Top with sliced avocado and serve straight from the skillet.",
    ],
  },
  r4: {
    prepTime: "5 min",
    servings: "1 serving",
    steps: [
      "Spoon a layer of Greek yogurt into a glass.",
      "Add a layer of mixed berries.",
      "Sprinkle with walnuts and chia seeds.",
      "Repeat the layers and serve chilled.",
    ],
  },
  r5: {
    prepTime: "25 min",
    servings: "2 servings",
    steps: [
      "Grill the chicken thigh until cooked through, then slice.",
      "Cook the jasmine rice until fluffy.",
      "Warm the black beans and prepare the mango salsa.",
      "Assemble the bowl with rice, chicken, beans, and salsa.",
    ],
  },
};

const TAG_STYLES = {
  highCalorie: "bg-[#f6ecd9] text-[#8a6a2f]",
  nutrientRich: "bg-[#e7ede2] text-[#4f6146]",
  neutral: "bg-[#efece7] text-[#5c564c]",
};

export default function RecipeDetailModal({
  recipe,
  open,
  onClose,
}: {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Keeps the last recipe rendered while the sheet fades out, since `recipe`
  // itself goes null the moment the caller clears its selection on close.
  const [displayRecipe, setDisplayRecipe] = useState<Recipe | null>(null);
  // Portal target isn't available during SSR — render nothing until mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (recipe) setDisplayRecipe(recipe);
  }, [recipe]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setScrolled(false);
    setSaved(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [recipe?.id]);

  if (!mounted || !displayRecipe) return null;

  const detail = RECIPE_DETAILS[displayRecipe.id];
  const ingredients = displayRecipe.description.replace(/\.$/, "").split(", ");
  const isHighCal = displayRecipe.category === "high-calorie";

  function handleScroll() {
    setScrolled((scrollRef.current?.scrollTop ?? 0) > 160);
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 isolate flex justify-center bg-white transition-opacity duration-300 ease-out",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      <div className="relative w-full max-w-md bg-white shadow-2xl">
        {/* Floating nav — transparent glass over the photo, solidifies once scrolled past it. */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pb-3 pt-4 transition-all duration-500 ease-out",
            scrolled && "border-b border-stone-100 bg-white/80 backdrop-blur-md"
          )}
        >
          <button
            onClick={onClose}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-stone-700 backdrop-blur-md transition-all duration-500 ease-out active:scale-95",
              scrolled ? "bg-stone-100" : "bg-white/85 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
            )}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Back to Today
          </button>
          <button
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-500 ease-out active:scale-90",
              scrolled ? "bg-stone-100" : "bg-white/85 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
            )}
          >
            <Heart
              className={cn("h-5 w-5 transition-colors duration-300", saved ? "fill-[var(--accent)] text-[var(--accent)]" : "text-stone-500")}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
          <div className="relative h-72 w-full shrink-0 overflow-hidden rounded-b-3xl">
            {displayRecipe.image && (
              <Image src={displayRecipe.image.src} alt={displayRecipe.image.alt} fill sizes="480px" className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden />
          </div>

          <div className="px-6 pb-24 pt-6">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-900">{displayRecipe.name}</h1>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", isHighCal ? TAG_STYLES.highCalorie : TAG_STYLES.nutrientRich)}>
                {isHighCal ? "High-Calorie Boost" : "Nutrient-Dense"}
              </span>
              {displayRecipe.glutenFree && (
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", TAG_STYLES.neutral)}>Gluten-Free Option</span>
              )}
              {displayRecipe.lactoseFree && (
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", TAG_STYLES.neutral)}>Lactose-Free</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-stone-50 px-3 py-3.5 text-center">
                <Clock className="mx-auto h-5 w-5 text-stone-400" strokeWidth={1.5} aria-hidden />
                <p className="mt-2 text-sm font-semibold text-stone-900">{detail.prepTime}</p>
                <p className="text-xs text-stone-400">Prep Time</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-3 py-3.5 text-center">
                <Flame className="mx-auto h-5 w-5 text-stone-400" strokeWidth={1.5} aria-hidden />
                <p className="mt-2 text-sm font-semibold text-stone-900">{displayRecipe.calories} kcal</p>
                <p className="text-xs text-stone-400">Calories</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-3 py-3.5 text-center">
                <Users className="mx-auto h-5 w-5 text-stone-400" strokeWidth={1.5} aria-hidden />
                <p className="mt-2 text-sm font-semibold text-stone-900">{detail.servings}</p>
                <p className="text-xs text-stone-400">Servings</p>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-9 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400">Ingredients</h2>
                <ul className="mt-4 space-y-3.5">
                  {ingredients.map((ing) => (
                    <li key={ing} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
                      <span className="text-base leading-snug text-stone-700">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400">How to Prepare</h2>
                <ol className="mt-4 space-y-5">
                  {detail.steps.map((step, i) => (
                    <li key={i} className="flex gap-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                        {i + 1}
                      </span>
                      <p className="pt-0.5 text-base leading-relaxed text-stone-700">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
