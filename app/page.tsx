import Link from "next/link";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

const FEATURES = [
  {
    title: "Effortless logging",
    description: "Clients log meals and workouts in seconds from a link — no app to install.",
  },
  {
    title: "Feedback in your voice",
    description: "AI responses are grounded in the methodology you set, not generic advice.",
  },
  {
    title: "Never miss a client",
    description: "Stale-activity alerts surface who's gone quiet before they fall off.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="bg-grid absolute inset-x-0 top-0 h-[560px]" aria-hidden />

      <div className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI-assisted coaching, without the WhatsApp thread
          </div>

          <h1
            className="animate-fade-in-up mt-6 text-balance text-4xl font-semibold tracking-tight text-stone-900 sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Coach more clients,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
            >
              without the busywork
            </span>
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-5 max-w-lg text-balance text-lg leading-relaxed text-stone-500"
            style={{ animationDelay: "140ms" }}
          >
            Your clients log meals and workouts, and get feedback in your voice — automatically,
            every time.
          </p>

          <div className="animate-fade-in-up mt-9 flex items-center justify-center gap-3" style={{ animationDelay: "200ms" }}>
            <Link href="/coach/login" className={buttonClasses("accent", "lg")}>
              Coach sign in / sign up
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div
          className="animate-fade-in-up mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3"
          style={{ animationDelay: "260ms" }}
        >
          {FEATURES.map((f) => (
            <Card key={f.title} interactive className="p-6 text-left">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                aria-hidden
              >
                ✓
              </div>
              <h3 className="text-sm font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{f.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
