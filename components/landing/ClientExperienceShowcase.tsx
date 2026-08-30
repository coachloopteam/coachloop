import Image from "next/image";
import { CheckCircle2, Dumbbell, Flower2, PersonStanding, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { DISCIPLINES, RECIPES, type Discipline } from "@/components/concept/mock-data";
import RevealOnScroll from "./RevealOnScroll";
import { cn } from "@/lib/cn";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[212px] rounded-[2rem] border-[6px] border-stone-900 bg-white p-1.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.35)]">
      <div className="h-[336px] overflow-hidden rounded-[1.4rem] bg-background">{children}</div>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full border border-stone-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500 backdrop-blur-md">
      Coming soon
    </span>
  );
}

export default function ClientExperienceShowcase() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            A beautiful, premium space for your clients.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-500">
            No complicated software. Just a habit-forming daily stream tailored to their goals.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {/* Card 1 — real: this is the actual client portal (app/c/[token]). */}
          <RevealOnScroll delayMs={0}>
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <PhoneFrame>
                <div className="flex h-full flex-col p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                      aria-hidden
                    >
                      J
                    </span>
                    <p className="text-[11px] font-semibold text-stone-700">Hey Jamie</p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-stone-100 bg-white py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5} aria-hidden />
                      <span className="text-[8px] font-semibold text-stone-600">Log a Meal</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-stone-100 bg-white py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <Dumbbell className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
                      <span className="text-[8px] font-semibold text-stone-600">Log a Workout</span>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-[8px] font-semibold uppercase tracking-wide text-stone-400">Today</p>

                  <div className="mt-2 flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-stone-900 px-2.5 py-2 text-[9px] leading-snug text-white">
                      Skipped my run, felt drained.
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 pr-0.5">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <CheckCircle2 className="relative h-3 w-3 text-emerald-500" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-[7px] font-medium text-stone-400">Logged</span>
                  </div>

                  <div className="mt-1.5 flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-stone-100 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center gap-1">
                        <span
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white"
                          style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                          aria-hidden
                        >
                          <Sparkles className="h-2 w-2" strokeWidth={2} />
                        </span>
                        <span className="text-[7px] font-semibold text-stone-400">Feedback</span>
                      </div>
                      <p className="mt-1 text-[9px] leading-snug text-stone-800">Totally fine — rest when you need it.</p>
                    </div>
                  </div>
                </div>
              </PhoneFrame>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">The Daily Stream</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                A clean, day-grouped stream of what they logged and how you responded — no dashboard
                to learn.
              </p>
            </div>
          </RevealOnScroll>

          {/* Card 2 — forward-looking, same "Coming soon" content and label as
              the Activity & Nutrition Vault section on this page. */}
          <RevealOnScroll delayMs={120}>
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <ComingSoonBadge />
              <PhoneFrame>
                <div className="flex h-full flex-col justify-center gap-2.5 p-3">
                  {DISCIPLINES.map((d) => {
                    const Icon = DISCIPLINE_ICON[d.id];
                    const img = d.image;
                    return (
                      <div
                        key={d.id}
                        className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                          <Image src={img.src} alt={img.alt} fill sizes="36px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-semibold text-stone-800">{d.name}</p>
                        </div>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white"
                          style={{ background: d.gradient }}
                          aria-hidden
                        >
                          <Icon className="h-2.5 w-2.5" strokeWidth={1.75} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </PhoneFrame>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">Activity &amp; Workouts</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                Fitness, Pilates, or Yoga — assigned by discipline, just as effortless to open.
              </p>
            </div>
          </RevealOnScroll>

          {/* Card 3 — forward-looking, same treatment as Card 2. */}
          <RevealOnScroll delayMs={240}>
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <ComingSoonBadge />
              <PhoneFrame>
                <div className="flex h-full flex-col justify-center gap-2.5 p-3">
                  {RECIPES.slice(0, 3).map((r) => {
                    const isHighCal = r.category === "high-calorie";
                    const img = r.image!;
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                          <Image src={img.src} alt={img.alt} fill sizes="36px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-semibold text-stone-800">{r.name}</p>
                          <span
                            className={cn(
                              "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[7px] font-semibold",
                              isHighCal ? "bg-[#f6ecd9] text-[#8a6a2f]" : "bg-[#e7ede2] text-[#4f6146]"
                            )}
                          >
                            {isHighCal ? "High-Calorie" : "Nutrient-Dense"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PhoneFrame>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">Premium Nutrition</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                Recipe suggestions tagged the way they actually think about food.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
