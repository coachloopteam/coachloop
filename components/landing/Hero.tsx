import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-24 sm:pb-16 sm:pt-32">
      <div className="bg-grid absolute inset-x-0 top-0 h-[560px]" aria-hidden />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Built for independent coaches, not developers
        </div>

        <h1
          className="animate-fade-in-up mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          AI-assisted coaching,
          <br />
          <span
            className="bg-clip-text text-transparent [filter:drop-shadow(0_2px_18px_rgba(225,74,80,0.35))]"
            style={{
              backgroundImage: "linear-gradient(120deg, #e14a50 0%, var(--accent) 35%, #d2482a 70%, #e14a50 100%)",
            }}
          >
            without the WhatsApp thread
          </span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-lg text-balance text-lg leading-relaxed text-stone-500"
          style={{ animationDelay: "140ms" }}
        >
          Your clients log meals and workouts from a link — no app to install — and get feedback in
          your voice, automatically, every time.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4" style={{ animationDelay: "200ms" }}>
          <Link
            href="/coach/login"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-stone-900 px-7 py-3.5 text-base font-semibold text-white transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-12px_rgba(255,90,95,0.55)]"
          >
            <span
              className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              style={{ background: "linear-gradient(120deg, var(--accent), #ff8a65)" }}
              aria-hidden
            />
            Coach sign in / sign up
            <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition-colors duration-300 hover:text-stone-700 hover:decoration-stone-400"
          >
            See how it works
          </a>
        </div>
      </div>

      <RevealOnScroll delayMs={100} className="relative mx-auto mt-16 max-w-2xl">
        <div
          className="overflow-hidden rounded-[2rem] p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] sm:p-10"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #2a2a2e 0%, #111113 55%, #0a0a0b 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
              aria-hidden
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">Live client preview</p>
          </div>

          <div className="mt-7 space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[78%] rounded-3xl rounded-br-lg bg-white px-5 py-3.5 text-stone-900 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
                <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">Client · today</p>
                <p className="mt-1 text-sm leading-relaxed">Skipped my run this morning, felt drained.</p>
              </div>
            </div>

            <RevealOnScroll delayMs={450} className="flex justify-start">
              <div className="max-w-[85%] rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-md">
                <p className="text-xs font-semibold text-white/50">Feedback, in your coach&apos;s voice</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                  Totally fine — rest when your body asks for it. Let&apos;s pick the plan back up tomorrow, no
                  guilt needed.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
