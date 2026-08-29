import { Dumbbell, Flame, Flower2, Leaf, PersonStanding, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import RevealOnScroll from "./RevealOnScroll";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Muted, "trendy cafe" tag tones rather than saturated status colors — pale
// gold for energy-dense, sage for nutrient-dense, warm gray for dietary tags.
const TAG_STYLES = {
  highCalorie: "bg-[#f6ecd9] text-[#8a6a2f]",
  nutrientRich: "bg-[#e7ede2] text-[#4f6146]",
  neutral: "bg-[#efece7] text-[#5c564c]",
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
                className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white text-center transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.18)]"
              >
                <div className="h-1" style={{ background: d.gradient }} aria-hidden />
                <div className="p-6">
                  <span
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white ring-4 ring-stone-50 transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{ background: d.gradient }}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <p className="mt-5 text-base font-semibold text-stone-900">{d.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{d.tagline}</p>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>

        <RevealOnScroll delayMs={220} className="mt-14">
          <h3 className="px-1 text-lg font-semibold text-stone-900">Healthy &amp; premium recipes</h3>
          <div className="mt-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RECIPES.slice(0, 5).map((r) => {
              const isHighCal = r.category === "high-calorie";
              return (
                <div
                  key={r.id}
                  className="w-[192px] shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.18)]"
                >
                  <div
                    className="flex h-24 items-center justify-center"
                    style={{
                      background: isHighCal
                        ? "linear-gradient(135deg, #f6ecd9, #e9cf9f)"
                        : "linear-gradient(135deg, #e7ede2, #c3d4b9)",
                    }}
                    aria-hidden
                  >
                    {isHighCal ? (
                      <Flame className="h-7 w-7 text-[#8a6a2f]/70" strokeWidth={1.25} />
                    ) : (
                      <Leaf className="h-7 w-7 text-[#4f6146]/70" strokeWidth={1.25} />
                    )}
                  </div>
                  <div className="space-y-2.5 p-4">
                    <p className="text-sm font-semibold leading-snug text-stone-900">{r.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors duration-300",
                          isHighCal ? TAG_STYLES.highCalorie : TAG_STYLES.nutrientRich
                        )}
                      >
                        {isHighCal ? "High-Calorie Boost" : "Nutrient-Dense"}
                      </span>
                      {r.glutenFree && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TAG_STYLES.neutral)}>
                          Gluten-Free
                        </span>
                      )}
                      {r.lactoseFree && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TAG_STYLES.neutral)}>
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
