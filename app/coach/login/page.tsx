"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <h1 className="text-xl font-semibold">{mode === "signup" ? "Create your coach account" : "Sign in"}</h1>

        {mode === "signup" && (
          <input
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          className="text-sm text-neutral-500 underline"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}
