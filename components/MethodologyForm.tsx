"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, BarChart3, Heart, Mail, NotebookPen, Sparkles, Zap } from "lucide-react";
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

// Spotify-style quick-start cards over the real tone field — clicking one
// just sets the same free-text `tone` value these coaches could always
// type by hand, so nothing about the underlying data model changes. Kept
// as presets rather than an enum because a coach's real voice rarely fits
// exactly one of three boxes; the textarea below stays fully editable.
const TONE_PRESETS = [
  {
    id: "direct",
    label: "Direct & Motivating",
    icon: Zap,
    value: "Direct and motivating — clear instructions, high energy, celebrates every win, no hedging.",
  },
  {
    id: "empathetic",
    label: "Empathetic & Soft",
    icon: Heart,
    value: "Empathetic and soft — leads with encouragement, gentle about setbacks, never judgmental.",
  },
  {
    id: "strict",
    label: "Strict & Data-Driven",
    icon: BarChart3,
    value: "Strict and data-driven — precise, references numbers and trends, minimal small talk.",
  },
];

// A realistic client message the preview is generated against — must match
// SAMPLE_ENTRY.content in app/api/coach/preview-feedback/route.ts, since
// that route builds the "sent" bubble content and this component renders
// it independently rather than round-tripping it through the response.
const SAMPLE_CLIENT_MESSAGE = "Hey coach, I struggled with the Pilates session today and missed my breakfast.";

export default function MethodologyForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [preview, setPreview] = useState<{ state: "idle" | "loading" | "done" | "error"; feedback?: string; error?: string }>({
    state: "idle",
  });

  const activePreset = TONE_PRESETS.find((p) => p.value === form.tone)?.id ?? null;

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
    <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      {/* Column 1 — Voice Customization Matrix */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-700" aria-hidden>
              <NotebookPen className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <label htmlFor="philosophy" className="block text-lg font-semibold text-stone-900">
                Your Coaching Philosophy
              </label>
              <p className="text-sm text-stone-500">Write your training rules in plain English — the AI only ever speaks from this.</p>
            </div>
          </div>
          <Textarea
            id="philosophy"
            rows={9}
            placeholder="e.g. I focus on high encouragement, simple instructions, and a friendly tone. I coach intuitive eating over strict macro counting — I want clients building a healthy relationship with food, not stressing over numbers. Consistency over intensity: showing up 4x a week beats one brutal session."
            value={form.training_philosophy}
            onChange={(e) => setForm({ ...form, training_philosophy: e.target.value })}
            className="min-h-[220px] rounded-2xl px-5 py-4 text-base leading-relaxed transition-all duration-300 ease-out"
          />
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="text-base font-semibold text-stone-900">Communication Style</h2>
          <p className="mt-1 text-sm text-stone-500">Pick a starting point, then make it yours below.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TONE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setForm({ ...form, tone: preset.value })}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-300 ease-out",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_8px_24px_-12px_rgba(255,90,95,0.45)]"
                      : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300",
                      active ? "bg-[var(--accent)] text-white" : "bg-stone-50 text-stone-600"
                    )}
                    aria-hidden
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </span>
                  <span className={cn("text-sm font-semibold leading-snug", active ? "text-stone-900" : "text-stone-700")}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          <Textarea
            id="tone"
            rows={2}
            placeholder="e.g. Supportive but direct, no fluff, occasional humor"
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
            className="mt-4 transition-all duration-300 ease-out"
          />
        </Card>

        <Card className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
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
            <label htmlFor="banned" className="mb-1.5 block text-sm font-medium text-stone-700">
              Topics to avoid
            </label>
            <Textarea
              id="banned"
              rows={3}
              placeholder="e.g. Don't discuss supplements, don't give medical advice"
              value={form.banned_topics}
              onChange={(e) => setForm({ ...form, banned_topics: e.target.value })}
            />
          </div>
        </Card>

        {/* Rule Triggers — a real vertical stack, not a fabricated one. There
            is exactly one automated behavior in this app today (stale-client
            flagging); it's a threshold, not a binary, so it gets a segmented
            control rather than a fake on/off switch. The second row is
            honestly disabled rather than wired to do nothing. */}
        <Card className="space-y-5 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-stone-900">Automated Behaviors</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600" aria-hidden>
                <AlarmClock className="h-5 w-5" strokeWidth={1.5} />
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
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 ease-out",
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
                <Mail className="h-5 w-5" strokeWidth={1.5} />
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
              className="relative h-7 w-12 shrink-0 rounded-full bg-stone-200 transition-colors duration-300"
              title="Not available yet"
            >
              <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300" />
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

      {/* Column 2 — Live Chat Simulator, in a floating phone mockup */}
      <div className="lg:sticky lg:top-8">
        <div className="animate-float mx-auto w-full max-w-[320px]">
          <div className="relative -rotate-1 overflow-hidden rounded-[2.75rem] border-[6px] border-stone-900 bg-stone-950 shadow-[0_40px_70px_-24px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out hover:rotate-0">
            <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-stone-900" aria-hidden />

            <div className="relative flex min-h-[560px] flex-col bg-background px-4 pb-6 pt-9">
              <div className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
                Live preview, in your voice
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-stone-900 px-4 py-3 text-white">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">Client · sample</p>
                    <p className="mt-1 text-sm leading-relaxed">{SAMPLE_CLIENT_MESSAGE}</p>
                  </div>
                </div>

                {preview.state === "done" && preview.feedback && (
                  <div key={preview.feedback} className="animate-scale-fade-in flex justify-start">
                    <div
                      className="max-w-[88%] rounded-3xl rounded-bl-lg border border-indigo-200/40 bg-white/70 px-4 py-3.5 backdrop-blur-md"
                      style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 12px 32px -12px rgba(99,102,241,0.45)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: "linear-gradient(135deg, #4338ca, #6366f1)" }}
                          aria-hidden
                        >
                          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <p className="text-xs font-semibold text-indigo-700">Coach&apos;s Assistant</p>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-800">{preview.feedback}</p>
                    </div>
                  </div>
                )}

                {preview.state === "loading" && (
                  <div className="flex justify-start">
                    <div className="w-[75%] space-y-2 rounded-3xl rounded-bl-lg border border-indigo-200/40 bg-white/70 px-4 py-4 backdrop-blur-md">
                      <div className="h-2.5 w-full animate-pulse rounded-full bg-indigo-100" />
                      <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-indigo-100" style={{ animationDelay: "150ms" }} />
                      <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-indigo-100" style={{ animationDelay: "300ms" }} />
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
                className="mt-4 w-full justify-center"
              >
                {preview.state === "idle" ? "See a preview" : "Try again"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
