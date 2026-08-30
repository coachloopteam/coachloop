"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardCheck, HeartHandshake, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Role = "coach" | "client";

const VALUE_PROPS = [
  { title: "AI feedback in your coaching voice", detail: "Grounded in the methodology you set — never generic advice." },
  { title: "Zero setup for your clients", detail: "Just a link. No app to install, no account for them to create." },
  { title: "Never miss a client gone quiet", detail: "Stale-activity alerts surface who needs a check-in." },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("coach");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      // The coaches row is created server-side by a database trigger on
      // auth.users (see supabase/schema.sql) as soon as the account exists —
      // not from here. That works whether or not email confirmation is on,
      // and doesn't depend on an RLS insert policy this browser session
      // wouldn't have anyway. `name` just rides along as user metadata for
      // the trigger to read.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signUpError || !data.user) {
        setError(signUpError?.message ?? "Could not sign up");
        setLoading(false);
        return;
      }

      if (!data.session) {
        // Email confirmation is required on this project — there's no active
        // session yet, so there's nothing to redirect into.
        setLoading(false);
        setInfo("Check your email to confirm your account, then sign in below.");
        setMode("signin");
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/coach");
    router.refresh();
  }

  // !outline-none: the app's global :focus-visible rule (globals.css) sets a
  // coral outline for the rest of the app's theme; it's unlayered CSS, so it
  // beats Tailwind utilities on layer priority alone regardless of
  // specificity. !important is the only reliable way to override it here so
  // this page's own focus ring isn't fighting a second, duplicate outline.
  const inputClasses =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-[15px] text-stone-900 " +
    "placeholder:text-stone-400 !outline-none transition-all duration-200 ease-out " +
    "hover:border-stone-300 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left: B2B2C value proposition — hidden below lg, where the form takes the full viewport. */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-stone-950 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 20% 15%, rgba(255,90,95,0.22), transparent 70%), " +
              "radial-gradient(45% 35% at 90% 85%, rgba(255,90,95,0.1), transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden
        />

        <div className="relative flex items-center gap-2 text-sm font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          CoachLoop
        </div>

        <div className="relative">
          <h2 className="text-balance text-[34px] font-bold leading-[1.15] tracking-tight text-white xl:text-4xl">
            Empower your clients. Scale your practice.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/40">
            Your clients log meals and workouts and get feedback in your voice, automatically — no
            app for them to install, no account for them to create. You focus on coaching, not
            admin.
          </p>

          <ul className="mt-10 space-y-5">
            {VALUE_PROPS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-white/40">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs font-medium text-white/30">Start free — no credit card required.</p>
      </div>

      {/* Right: role selector + form */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-background px-4 py-16 lg:bg-white">
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(255,90,95,0.08), transparent 70%), " +
              "radial-gradient(40% 35% at 85% 15%, rgba(255,90,95,0.06), transparent 70%)",
          }}
          aria-hidden
        />

        <div className="animate-fade-in-up relative w-full max-w-[400px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden /> CoachLoop
          </Link>

          <div
            className="rounded-2xl border border-stone-100 bg-white/90 p-8 backdrop-blur-sm sm:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
            style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.16)" }}
          >
            <div className="mb-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("coach")}
                aria-pressed={role === "coach"}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all duration-300 ease-out",
                  role === "coach"
                    ? "border-transparent bg-stone-900 text-white shadow-[0_16px_32px_-16px_rgba(0,0,0,0.45)]"
                    : "border-stone-200 bg-white text-stone-400 hover:-translate-y-0.5 hover:border-stone-300"
                )}
              >
                <ClipboardCheck className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                <span className="text-sm font-semibold">Coach</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                aria-pressed={role === "client"}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all duration-300 ease-out",
                  role === "client"
                    ? "border-transparent bg-stone-900 text-white shadow-[0_16px_32px_-16px_rgba(0,0,0,0.45)]"
                    : "border-stone-200 bg-white text-stone-400 hover:-translate-y-0.5 hover:border-stone-300"
                )}
              >
                <HeartHandshake className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                <span className="text-sm font-semibold">Client</span>
              </button>
            </div>

            {role === "coach" ? (
              <form key="coach" onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[28px]">
                    {mode === "signup" ? "Create your workspace" : "Sign in to your dashboard"}
                  </h1>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-500">
                    {mode === "signup" ? "Set up your coaching workspace in seconds." : "Welcome back."}
                  </p>
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      className={inputClasses}
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className={inputClasses}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className={inputClasses}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}
                {info && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                    {info}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#161614] py-3.5 text-[15px] font-semibold text-white
                    shadow-[0_12px_28px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out
                    hover:-translate-y-0.5 hover:scale-[1.01] hover:border-white/0 hover:shadow-[0_18px_36px_-12px_rgba(255,90,95,0.5)]
                    active:scale-[0.98]
                    disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span
                    className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                    style={{ background: "linear-gradient(120deg, var(--accent), #ff8a65)" }}
                    aria-hidden
                  />
                  {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </button>

                <button
                  type="button"
                  className="w-full text-center text-sm text-stone-500 transition-colors hover:text-stone-900"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                >
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <span className="font-medium text-stone-900 underline decoration-stone-300 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]">
                        Sign in
                      </span>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <span className="font-medium text-stone-900 underline decoration-stone-300 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]">
                        Create an account
                      </span>
                    </>
                  )}
                </button>

                {mode === "signup" && (
                  <p className="border-t border-stone-100 pt-5 text-center text-xs leading-relaxed text-stone-400">
                    Your clients get a private link to their own portal — no download, no account
                    required on their end.
                  </p>
                )}
              </form>
            ) : (
              <div key="client" className="animate-fade-in space-y-6 text-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[28px]">
                    Access your daily routine
                  </h1>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-500">
                    No account to create, and nothing to sign in to here.
                  </p>
                </div>

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Link2 className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-left">
                  <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" strokeWidth={1.5} aria-hidden />
                  <p className="text-sm leading-relaxed text-stone-600">
                    Your coach sends you a private link by text or email. Opening it on your phone
                    takes you straight to your own portal — no password, no app to install.
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-stone-400">
                  Lost your link? Ask your coach to resend it — they can grab it from their
                  dashboard any time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
