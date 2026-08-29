"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="bg-grid absolute inset-x-0 top-0 h-[420px]" aria-hidden />

      <div className="animate-fade-in-up relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
        >
          ← CoachLoop
        </Link>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">
                {mode === "signup" ? "Create your coach account" : "Sign in"}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                {mode === "signup" ? "Set up your coaching workspace in seconds." : "Welcome back."}
              </p>
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
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
              <Input
                id="email"
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
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            {info && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {info}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-stone-500 underline-offset-4 transition-colors hover:text-stone-900 hover:underline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
