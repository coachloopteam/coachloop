"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, Mail, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type FormState = {
  training_philosophy: string;
  nutrition_rules: string;
  tone: string;
  banned_topics: string;
  stale_after_days: number;
};

type Props = { initial: FormState };

const DAY_OPTIONS = [2, 3, 5, 7];

// A realistic client message the preview is generated against — the same
// one the server uses, shown here just for the "sent" bubble.
const SAMPLE_CLIENT_MESSAGE = "Had a rough day, skipped my workout and ate a whole pizza. Feeling pretty guilty about it.";

export default function MethodologyForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [preview, setPreview] = useState<{ state: "idle" | "loading" | "done" | "error"; feedback?: string; error?: string }>({
    state: "idle",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/coach/methodology", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  async function runPreview() {
    setPreview({ state: "loading" });
    try {
      const res = await fetch("/api/coach/preview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreview({ state: "error", error: data.error || "Couldn't generate a preview." });
        return;
      }
      setPreview({ state: "done", feedback: data.feedback });
    } catch {
      setPreview({ state: "error", error: "Couldn't reach the AI assistant. Try again in a moment." });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      {/* Left: the actual configuration */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-8">
          <label htmlFor="philosophy" className="mb-1 block text-lg font-semibold text-stone-900">
            Your coaching philosophy
          </label>
          <p className="mb-4 text-sm text-stone-500">
            Tell us how you coach. Do you prefer strict macro counting or intuitive eating? Are you
            tough-love or high-encouragement? Write it like you&apos;d explain it to a new client.
          </p>
          <Textarea
            id="philosophy"
            rows={9}
            placeholder="e.g. I coach intuitive eating over strict macro counting — I want clients building a healthy relationship with food, not stressing over numbers. Training-wise I'm a believer in consistency over intensity: showing up 4x a week beats one brutal session. I'm high-encouragement — I'd rather celebrate a small win than point out what was missed."
            value={form.training_philosophy}
            onChange={(e) => setForm({ ...form, training_philosophy: e.target.value })}
            className="min-h-[220px] rounded-2xl px-5 py-4 text-base leading-relaxed"
          />
        </Card>

        <Card className="space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="nutrition" className="mb-1.5 block text-sm font-medium text-stone-700">
              Nutrition rules
            </label>
            <Textarea
              id="nutrition"
              rows={3}
              placeholder="e.g. Whole-food first, protein target 1.6g/kg, no strict calorie counting for beginners…"
              value={form.nutrition_rules}
              onChange={(e) => setForm({ ...form, nutrition_rules: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="tone" className="mb-1.5 block text-sm font-medium text-stone-700">
              Voice / tone
            </label>
            <Textarea
              id="tone"
              rows={2}
              placeholder="e.g. Supportive but direct, no fluff, occasional humor"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="banned" className="mb-1.5 block text-sm font-medium text-stone-700">
              Topics to avoid
            </label>
            <Textarea
              id="banned"
              rows={2}
              placeholder="e.g. Don't discuss supplements, don't give medical advice"
              value={form.banned_topics}
              onChange={(e) => setForm({ ...form, banned_topics: e.target.value })}
            />
          </div>
        </Card>

        <Card className="space-y-5 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-stone-900">Preferences</h2>

          {/* Real: this actually changes when clients show up under "Needs
              Your Attention" on the dashboard (app/coach/page.tsx). Not a
              plain on/off — the underlying behavior is a threshold, so a
              pill selector is the honest version of a "toggle" here. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600" aria-hidden>
                <AlarmClock className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800">Flag clients who&apos;ve gone quiet</p>
                <p className="text-sm text-stone-500">
                  Show a client under &quot;Needs Your Attention&quot; after this many days without a check-in.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5 rounded-full bg-stone-100 p-1">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, stale_after_days: d })}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    form.stale_after_days === d ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Honest placeholder, not fake functionality: there's no email/push
              delivery or scheduled-send system in this app yet, so this
              can't actually send anything today. Shown disabled rather than
              silently wired to do nothing. */}
          <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-5 opacity-60">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400" aria-hidden>
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-stone-800">
                  Send motivational quotes automatically on Mondays
                  <Badge variant="neutral">Coming soon</Badge>
                </p>
                <p className="text-sm text-stone-500">We&apos;ll let you know when this is ready to turn on.</p>
              </div>
            </div>
            <span
              aria-disabled
              className="relative h-7 w-12 shrink-0 rounded-full bg-stone-200"
              title="Not available yet"
            >
              <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow" />
            </span>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save methodology"}
          </Button>
          {saved && <span className="animate-fade-in text-sm font-medium text-emerald-600">Saved.</span>}
        </div>
      </form>

      {/* Right: live preview */}
      <div className="lg:sticky lg:top-8">
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold text-stone-900">How your AI assistant will sound</h2>
            <p className="mt-0.5 text-sm text-stone-500">A preview of a real reply, in your voice.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[90%] rounded-3xl rounded-br-lg bg-stone-900 px-4 py-3 text-white">
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">Client · sample</p>
                <p className="mt-1 text-sm leading-relaxed">{SAMPLE_CLIENT_MESSAGE}</p>
              </div>
            </div>

            {preview.state === "done" && preview.feedback && (
              <div className="animate-fade-in flex justify-start">
                <div className="max-w-[90%] rounded-3xl rounded-bl-lg border border-stone-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                      aria-hidden
                    >
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <p className="text-xs font-semibold text-stone-500">Your AI assistant</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-800">{preview.feedback}</p>
                </div>
              </div>
            )}

            {preview.state === "loading" && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-lg border border-stone-100 bg-white px-4 py-3 text-sm text-stone-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  Thinking, in your voice…
                </div>
              </div>
            )}

            {preview.state === "error" && (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {preview.error}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={runPreview}
            disabled={preview.state === "loading"}
            className="w-full justify-center"
          >
            {preview.state === "idle" ? "See a preview" : "Try again"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
