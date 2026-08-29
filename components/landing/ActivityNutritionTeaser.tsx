import { Dumbbell, Flame, Flower2, Leaf, PersonStanding, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import RevealOnScroll from "./RevealOnScroll";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Not a shipped feature yet — see components/concept/mock-data.ts. Kept
// clearly labeled "Coming soon" since this is the public landing page, not
// an internal design preview: nothing here should read as a capability the
// product already has.
export default function ActivityNutritionTeaser() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Coming soon
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            The Activity &amp; Nutrition Vault
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-500">
            Next on the roadmap: assign sessions by discipline and suggest recipes your clients can
            actually follow — still just as effortless for them.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delayMs={120} className="mt-12 grid gap-4 sm:grid-cols-3">
          {DISCIPLINES.map((d) => {
            const Icon = DISCIPLINE_ICON[d.id];
            return (
              <div
                key={d.id}
                className="group rounded-3xl border border-stone-200/80 bg-white p-6 text-center transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.18)]"
              >
                <span
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ background: d.gradient }}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-base font-semibold text-stone-900">{d.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">{d.tagline}</p>
              </div>
            );
          })}
        </RevealOnScroll>

        <RevealOnScroll delayMs={220} className="mt-14">
          <h3 className="px-1 text-lg font-semibold text-stone-900">Healthy &amp; premium recipes</h3>
          <div className="mt-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RECIPES.slice(0, 5).map((r) => {
              const isHighCal = r.category === "high-calorie";
              return (
                <div
                  key={r.id}
                  className="w-[188px] shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.18)]"
                >
                  <div
                    className="flex h-24 items-center justify-center"
                    style={{
                      background: isHighCal
                        ? "linear-gradient(135deg, #fde4c8, #fbb768)"
                        : "linear-gradient(135deg, #dcecd9, #9fc79a)",
                    }}
                    aria-hidden
                  >
                    {isHighCal ? (
                      <Flame className="h-7 w-7 text-amber-700/70" strokeWidth={1.25} />
                    ) : (
                      <Leaf className="h-7 w-7 text-emerald-800/60" strokeWidth={1.25} />
                    )}
                  </div>
                  <div className="space-y-2.5 p-4">
                    <p className="text-sm font-semibold leading-snug text-stone-900">{r.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors duration-300",
                          isHighCal ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {isHighCal ? "High-Calorie Boost" : "Nutrient-Dense"}
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
        </RevealOnScroll>
      </div>
    </section>
  );
}
