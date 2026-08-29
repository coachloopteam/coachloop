import Link from "next/link";

const YEAR = new Date().getFullYear();

const LINKS = [
  { href: "/coach/login", label: "Coach sign in / sign up" },
  { href: "#features", label: "How it works" },
];

export default function LandingFooter() {
  return (
    <footer className="mt-8 bg-stone-950 px-4 py-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
            <span className="text-sm font-semibold text-white">CoachLoop</span>
          </div>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/40">
            AI-assisted coaching, without the WhatsApp thread.
          </p>
        </div>

        <nav className="flex flex-col items-center gap-3 sm:items-end">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/50 underline decoration-white/0 underline-offset-4 transition-all duration-300 ease-out hover:text-white hover:decoration-white/40"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/30 sm:text-left">
        © {YEAR} CoachLoop. Made for coaches who&apos;d rather coach.
      </div>
    </footer>
  );
}
