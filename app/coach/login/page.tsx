"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CoachLoginPage() {
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
  // this page's indigo ring (the one actual focus indicator) isn't fighting
  // a second, mismatched-color outline underneath it.
  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 " +
    "placeholder:text-slate-400 !outline-none transition-all duration-200 ease-out " +
    "hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16">
      {/* Soft ambient gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.10), transparent 70%), " +
            "radial-gradient(40% 35% at 85% 15%, rgba(16,185,129,0.08), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.07) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="animate-fade-in-up relative w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <span aria-hidden>←</span> CoachLoop
        </Link>

        <div
          className="rounded-2xl border border-slate-100 bg-white/90 p-8 backdrop-blur-sm sm:p-9"
          style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.16)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                {mode === "signup" ? "Create your coach account" : "Sign in"}
              </h1>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-500">
                {mode === "signup" ? "Set up your coaching workspace in seconds." : "Welcome back."}
              </p>
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="name">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
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
              className="group relative w-full overflow-hidden rounded-xl bg-slate-900 py-3.5 text-[15px] font-semibold text-white
                transition-all duration-200 ease-out
                hover:scale-[1.02] hover:bg-black active:scale-[0.98]
                disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15), 0 12px 24px -8px rgba(15,23,42,0.35)" }}
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>

            <button
              type="button"
              className="w-full text-center text-sm text-slate-500 transition-colors hover:text-slate-900"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <span className="font-medium text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors hover:decoration-indigo-500">
                    Sign in
                  </span>
                </>
              ) : (
                <>
                  New here?{" "}
                  <span className="font-medium text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors hover:decoration-indigo-500">
                    Create an account
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
