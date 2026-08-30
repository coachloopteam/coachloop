"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardCheck, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

// Accepts either a bare token or a full pasted portal URL
// (https://.../c/<token>?...) — takes the /c/ segment if present.
function extractToken(raw: string): string {
  const trimmed = raw.trim();
  const marker = "/c/";
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return trimmed;
  return trimmed.slice(idx + marker.length).split(/[/?#]/)[0];
}

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

  const [clientMode, setClientMode] = useState<"signin" | "signup">("signin");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<string | null>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Arriving from the portal's "Save your login" link (/coach/login?role=client&token=...)
  // pre-fills the token and jumps straight to the Client / create-account view.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (params.get("role") === "client") setRole("client");
    if (token) {
      setClientToken(token);
      setClientMode("signup");
    }
  }, []);

  async function handleClientSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError(null);
    setClientInfo(null);
    setClientLoading(true);
    const supabase = createClient();

    if (clientMode === "signup") {
      const token = extractToken(clientToken);
      if (!token) {
        setClientError("Enter the private link or code your coach sent you.");
        setClientLoading(false);
        return;
      }

      const res = await fetch("/api/client/claim-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: clientEmail, password: clientPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClientError(data.error ?? "Could not create your account");
        setClientLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: clientEmail,
        password: clientPassword,
      });
      if (signInError) {
        // Account exists now even though this particular sign-in call
        // failed — send them to sign in manually rather than stalling here.
        setClientLoading(false);
        setClientInfo("Account created — sign in below.");
        setClientMode("signin");
        return;
      }

      router.push(`/c/${token}`);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: clientEmail,
      password: clientPassword,
    });
    if (signInError) {
      setClientError(signInError.message);
      setClientLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const { data: clientRow } = await supabase
      .from("clients")
      .select("invite_token")
      .eq("auth_user_id", authData?.user?.id ?? "")
      .single();

    if (!clientRow?.invite_token) {
      setClientLoading(false);
      setClientError("Signed in, but couldn't find your portal — ask your coach to check your link.");
      return;
    }

    router.push(`/c/${clientRow.invite_token}`);
  }

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
    "hover:border-stone-300 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] " +
    "focus:shadow-[0_6px_20px_-6px_rgba(255,90,95,0.4)]";

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
            <div className="relative mb-7 flex rounded-full border border-stone-200 bg-stone-100/70 p-1 backdrop-blur-md">
              <div
                className="absolute inset-y-1 left-1 rounded-full bg-stone-900 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out"
                style={{ width: "calc(50% - 4px)", transform: role === "client" ? "translateX(100%)" : "translateX(0%)" }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setRole("coach")}
                aria-pressed={role === "coach"}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors duration-300 ease-out",
                  role === "coach" ? "text-white" : "text-stone-500 hover:text-stone-800"
                )}
              >
                <ClipboardCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                I am a Coach
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                aria-pressed={role === "client"}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors duration-300 ease-out",
                  role === "client" ? "text-white" : "text-stone-500 hover:text-stone-800"
                )}
              >
                <HeartHandshake className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                I am a Client
              </button>
            </div>

            {role === "coach" ? (
              <form key="coach" onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[28px]">
                    {mode === "signup" ? "Create your workspace" : "Sign in to your dashboard"}
                  </h1>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-500">
                    Access your workspace and management tools.
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
              <form key="client" onSubmit={handleClientSubmit} className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[28px]">
                    {clientMode === "signup" ? "Save your login" : "Welcome back"}
                  </h1>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-500">
                    Access your daily routine and coach stream.
                  </p>
                </div>

                {clientMode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="client-token">
                      Your private link or code
                    </label>
                    <input
                      id="client-token"
                      className={inputClasses}
                      placeholder="Paste the link your coach sent you"
                      value={clientToken}
                      onChange={(e) => setClientToken(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="client-email">
                    Email
                  </label>
                  <input
                    id="client-email"
                    className={inputClasses}
                    type="email"
                    placeholder="Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="client-password">
                    Password
                  </label>
                  <input
                    id="client-password"
                    className={inputClasses}
                    type="password"
                    placeholder="Password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {clientError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                    {clientError}
                  </p>
                )}
                {clientInfo && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                    {clientInfo}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={clientLoading}
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
                  {clientLoading ? "Please wait…" : clientMode === "signup" ? "Save my login" : "Sign in"}
                </button>

                <button
                  type="button"
                  className="w-full text-center text-sm text-stone-500 transition-colors hover:text-stone-900"
                  onClick={() => {
                    setClientError(null);
                    setClientInfo(null);
                    setClientMode(clientMode === "signup" ? "signin" : "signup");
                  }}
                >
                  {clientMode === "signup" ? (
                    <>
                      Already saved your login?{" "}
                      <span className="font-medium text-stone-900 underline decoration-stone-300 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]">
                        Sign in
                      </span>
                    </>
                  ) : (
                    <>
                      First time here?{" "}
                      <span className="font-medium text-stone-900 underline decoration-stone-300 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]">
                        Save your login
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-start gap-3 border-t border-stone-100 pt-5 text-left">
                  <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" strokeWidth={1.5} aria-hidden />
                  <p className="text-xs leading-relaxed text-stone-500">
                    {clientMode === "signup"
                      ? "Your coach sends you a private link by text or email — paste it above, or open it directly and tap “Save your login” there. You don’t need this at all if you’d rather just use the link every time."
                      : "Lost your link, or never saved a login? Ask your coach to resend your private link — opening it still gets you straight to your portal, no password needed."}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
