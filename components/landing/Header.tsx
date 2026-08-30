import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Sits transparent over the dark cinematic hero — there's no separate
// "page chrome" anywhere else in the app (coach/client views have their
// own headers), so this is the first true site-wide nav CoachLoop has had.
export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-4 pt-6 sm:pt-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          CoachLoop
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <a href="#trending" className="text-sm font-medium text-white/50 transition-colors duration-300 hover:text-white">
            Solution Hubs
          </a>
          <a href="#features" className="text-sm font-medium text-white/50 transition-colors duration-300 hover:text-white">
            Features
          </a>
        </nav>

        <Link
          href="/coach/login"
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-500 ease-out hover:border-white/30 hover:bg-white/[0.12]"
        >
          Sign in
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
