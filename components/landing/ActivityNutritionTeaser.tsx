import Image from "next/image";
import { Dumbbell, Flower2, PersonStanding, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import RevealOnScroll from "./RevealOnScroll";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

// Real, verified Unsplash photos (via WebSearch + WebFetch of the actual
// photo page — never guessed) under the free Unsplash License.
const DISCIPLINE_IMAGES: Record<Discipline["id"], { src: string; alt: string }> = {
  fitness: {
    src: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=800&auto=format&fit=crop",
    alt: "Grayscale gym equipment in moody light",
  },
  pilates: {
    src: "https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=800&auto=format&fit=crop",
    alt: "Pilates reformer workout in a bright studio",
  },
  yoga: {
    src: "https://images.unsplash.com/photo-1687783615494-b4a1f1af8b58?q=80&w=800&auto=format&fit=crop",
    alt: "Bright minimalist yoga studio with mats",
  },
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
            const img = DISCIPLINE_IMAGES[d.id];
            return (
              <div
                key={d.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-stone-200/80 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden />
                {/* Extra dim on hover — makes the title/tagline pop a little more. */}
                <div
                  className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/20"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-left">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white ring-1 ring-white/25 backdrop-blur-md"
                    style={{ background: d.gradient }}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="mt-3 text-lg font-semibold text-white">{d.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{d.tagline}</p>
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
              const img = r.image!;
              return (
                <div
                  key={r.id}
                  className="group w-[200px] shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/10"
                      aria-hidden
                    />
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
