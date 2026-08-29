"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type LogType = "meal" | "workout";

const OPTIONS: { type: LogType; icon: string; label: string; placeholder: string; iconBg: string }[] = [
  {
    type: "meal",
    icon: "📸",
    label: "Log a Meal",
    placeholder: "e.g. Grilled chicken, rice, and a banana",
    iconBg: "#fef3c7",
  },
  {
    type: "workout",
    icon: "💪",
    label: "Log a Workout",
    placeholder: "e.g. 5x5 squats at 80kg, felt strong",
    iconBg: "var(--accent-soft)",
  },
];

export default function LogButtons({ token }: { token: string }) {
  const [open, setOpen] = useState<LogType | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const active = OPTIONS.find((o) => o.type === open);

  function close() {
    setOpen(null);
    setContent("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !open) return;
    setLoading(true);
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, type: open, content }),
    });
    setLoading(false);
    if (res.ok) {
      // The new log + its feedback appear in the stream below once the
      // server data refreshes — no need to duplicate it locally first.
      close();
      router.refresh();
    }
  }

  // Collapsed: the two massive, unmistakable entry points. Nothing else to
  // learn — tap the one that matches what you're logging.
  if (!active) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => (
          <button
            key={o.type}
            onClick={() => setOpen(o.type)}
            className="flex flex-col items-center gap-3 rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ background: o.iconBg }}
              aria-hidden
            >
              {o.icon}
            </span>
            <span className="text-base font-bold leading-tight text-stone-900">{o.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Expanded: one field, one job. No type toggle to fiddle with — tapping
  // the button already decided that.
  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in space-y-3 rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: active.iconBg }}
          aria-hidden
        >
          {active.icon}
        </span>
        <h2 className="text-lg font-bold text-stone-900">{active.label}</h2>
      </div>

      <textarea
        autoFocus
        rows={3}
        placeholder={active.placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-900 placeholder:text-stone-400 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
      />

      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className={cn(
            "flex-1 rounded-2xl py-4 text-base font-bold text-white transition-all duration-200 ease-out active:scale-[0.97]",
            "bg-stone-900 hover:bg-stone-800 disabled:opacity-50"
          )}
        >
          {loading ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={loading}
          className="rounded-2xl border border-stone-200 px-5 py-4 text-base font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
