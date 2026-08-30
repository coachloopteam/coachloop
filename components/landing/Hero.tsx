import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import Header from "./Header";
import TrendingSolutionHubs from "./TrendingSolutionHubs";

// Real, verified Unsplash photo (WebSearch + WebFetch of the actual photo
// page, never guessed) — a trainer actively coaching a client through a
// lift. There's no video hosting anywhere in this app (see
// components/concept/MediaHub.tsx's honestly-static "Guided Session"
// placeholder), so this is the real centerpiece rather than a fabricated
// video loop; the slow Ken Burns drift (see app/globals.css) is where the
// "in motion" feeling actually comes from.
const HERO_MEDIA = {
  src: "https://images.unsplash.com/photo-1758875568671-9fa1829fe1e3?q=80&w=2000&auto=format&fit=crop",
  alt: "A coach spotting a client through a barbell squat in a gym",
};

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-stone-950">
      <Header />

      <div className="relative min-h-[94vh] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={HERO_MEDIA.src}
            alt={HERO_MEDIA.alt}
            fill
            priority
            sizes="100vw"
            className="animate-ken-burns object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-transparent to-transparent" aria-hidden />

        <div className="absolute right-4 top-24 sm:right-8 sm:top-28">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/40 px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur-xl">
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} fill="currentColor" aria-hidden />
            Elite coaching, in motion
          </span>
        </div>

        <div className="relative z-10 flex min-h-[94vh] flex-col justify-end px-4 pb-20 pt-32 sm:pb-24">
          <div className="mx-auto w-full max-w-4xl text-center">
            <RevealOnScroll>
              <div
                className="mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 px-6 py-9 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out sm:px-14 sm:py-12"
                style={{ boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6)" }}
              >
                <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                  The premium space for
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(120deg, #ff8a65 0%, var(--accent) 45%, #ffb199 100%)",
                    }}
                  >
                    elite coaching and daily growth.
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-white/55 sm:text-lg">
                  A beautiful, habit-forming stream where clients log workouts and meals in seconds, and
                  receive personalized feedback grounded in your coach&apos;s exact voice. No clutter, no
                  chaos.
                </p>

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/coach/login"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white px-7 py-3.5 text-base font-semibold text-stone-900 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:scale-[1.02]"
                  >
                    <span
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
                      style={{ background: "linear-gradient(120deg, var(--accent), #ff8a65)" }}
                      aria-hidden
                    />
                    <span className="transition-colors duration-700 ease-out group-hover:text-white">
                      Coach sign in / sign up
                    </span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-700 ease-out group-hover:translate-x-1 group-hover:text-white"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>
                  <a
                    href="#trending"
                    className="text-sm font-medium text-white/50 underline decoration-white/20 underline-offset-4 transition-colors duration-500 hover:text-white hover:decoration-white/50"
                  >
                    See how it works
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      <TrendingSolutionHubs />
    </section>
  );
}
