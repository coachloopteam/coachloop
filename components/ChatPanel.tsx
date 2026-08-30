"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Dumbbell, Sparkles, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TimelineEntry } from "@/lib/timeline";

export type { TimelineEntry };

type CatalogItem = { id: string; title: string };

const TYPE_ICON = { meal: UtensilsCrossed, workout: Dumbbell } as const;

const POLL_INTERVAL_MS = 4000;

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// The premium communication panel: a unified timeline (free-text logs +
// AI replies, real workout/recipe completions from daily_logs, and real
// coach-authored chat messages) plus a composer with two catalog-backed
// attach actions. Tokenless clients have no auth.uid() for Supabase
// Realtime's RLS to key off, so new coach messages arrive via polling
// (see app/api/messages/poll) rather than a push subscription — the
// coach's own dashboard (CoachChatPanel.tsx) uses real Realtime since it
// has an authenticated session.
export default function ChatPanel({
  token,
  coachName,
  entries,
  workouts,
  recipes,
}: {
  token: string;
  coachName: string;
  entries: TimelineEntry[];
  workouts: CatalogItem[];
  recipes: CatalogItem[];
}) {
  const [content, setContent] = useState("");
  const [logType, setLogType] = useState<"meal" | "workout">("meal");
  const [picker, setPicker] = useState<"workout" | "recipe" | null>(null);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<{ content: string; logType: "meal" | "workout" } | null>(null);
  const [liveChat, setLiveChat] = useState<TimelineEntry[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastPolledAt = useRef<string>(
    entries.filter((e) => e.kind === "chat").reduce((max, e) => (e.at > max ? e.at : max), "1970-01-01T00:00:00.000Z")
  );
  // Guards against overlapping poll requests (e.g. a slow response still
  // in flight when the next interval tick fires, or React Strict Mode's
  // double effect-invocation in dev) — without this, two ticks can both
  // read the same lastPolledAt.current before either updates it, fetch
  // the same row twice, and append a duplicate React key.
  const pollInFlight = useRef(false);
  const seenIds = useRef(new Set(entries.filter((e) => e.kind === "chat").map((e) => e.id)));

  // The optimistic bubble is cleared exactly when the router.refresh()
  // transition settles — by then `entries` carries the real, persisted
  // message and AI reply, so there's no gap where neither is shown.
  useEffect(() => {
    if (!isPending) setPending(null);
  }, [isPending]);

  // Polls for new coach-authored messages. Real-time-*feeling*, not true
  // push delivery — see the file-level note above for why.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      try {
        const res = await fetch(`/api/messages/poll?token=${encodeURIComponent(token)}&since=${encodeURIComponent(lastPolledAt.current)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages?.length) {
          const fresh = data.messages.filter((m: { id: string }) => !seenIds.current.has(m.id));
          const newEntries: TimelineEntry[] = fresh.map((m: { id: string; sender_role: "coach" | "client"; content: string; created_at: string }) => {
            seenIds.current.add(m.id);
            return { kind: "chat" as const, id: m.id, senderRole: m.sender_role, content: m.content, at: m.created_at };
          });
          if (newEntries.length) setLiveChat((prev) => [...prev, ...newEntries]);
          lastPolledAt.current = data.messages[data.messages.length - 1].created_at;
        }
      } catch {
        // Transient network hiccup — the next interval tries again.
      } finally {
        pollInFlight.current = false;
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token]);

  function attach(kind: "workout" | "recipe", title: string) {
    setContent((prev) => (prev.trim() ? `${prev.trim()} ${title} — ` : `${title} — `));
    setLogType(kind === "workout" ? "workout" : "meal");
    setPicker(null);
    textareaRef.current?.focus();
  }

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setPending({ content: trimmed, logType });
    setContent("");

    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, type: logType, content: trimmed }),
    });
    setSending(false);
    setLogType("meal");

    if (res.ok) {
      startTransition(() => router.refresh());
    } else {
      setPending(null);
    }
  }

  const groups: { label: string; items: TimelineEntry[] }[] = [];
  for (const e of [...entries, ...liveChat].reverse()) {
    const label = dayLabel(e.at);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.label} className="space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-stone-400">{g.label}</p>
            {g.items.map((entry) => (
              <TimelineBubble key={`${entry.kind}-${entry.id}`} entry={entry} coachName={coachName} />
            ))}
          </div>
        ))}

        {pending && (
          <div className="animate-fade-in space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-stone-900 px-5 py-3.5 text-white opacity-70 transition-opacity duration-500 ease-out">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/60">
                  {(() => {
                    const Icon = TYPE_ICON[pending.logType];
                    return <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />;
                  })()}
                  {pending.logType} · sending…
                </p>
                <p className="mt-1 text-base leading-relaxed">{pending.content}</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="w-[70%] space-y-2 rounded-3xl rounded-bl-lg border border-indigo-200/40 bg-white/70 px-4 py-4 backdrop-blur-md">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Analyzing, in {coachName}&apos;s voice…
                </p>
                <div className="h-2.5 w-full animate-pulse rounded-full bg-indigo-100" />
                <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-indigo-100" style={{ animationDelay: "150ms" }} />
                <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-indigo-100" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative rounded-3xl border border-stone-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]">
        {picker && (
          <div className="absolute inset-x-3 bottom-full z-10 mb-2 max-h-56 overflow-y-auto rounded-2xl border border-stone-100 bg-white p-2 shadow-[0_20px_44px_-16px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out">
            {(picker === "workout" ? workouts : recipes).length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-stone-400">Nothing here yet.</p>
            ) : (
              (picker === "workout" ? workouts : recipes).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => attach(picker, item.title)}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-50"
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 pb-2">
          <button
            type="button"
            onClick={() => setPicker((p) => (p === "workout" ? null : "workout"))}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out",
              picker === "workout" ? "bg-stone-900 text-white" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            )}
          >
            <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            Attach Workout Protocol
          </button>
          <button
            type="button"
            onClick={() => setPicker((p) => (p === "recipe" ? null : "recipe"))}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out",
              picker === "recipe" ? "bg-stone-900 text-white" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            )}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            Share Recipe Card
          </button>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message your coach…"
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-base text-stone-900 placeholder:text-stone-400 outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-all duration-300 ease-out hover:bg-stone-800 active:scale-90 disabled:opacity-40"
          >
            <ArrowUp className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineBubble({ entry, coachName }: { entry: TimelineEntry; coachName: string }) {
  if (entry.kind === "completion") {
    const Icon = entry.completionType === "workout" ? Dumbbell : UtensilsCrossed;
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-xs font-semibold text-emerald-700">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          {entry.label} {entry.completionType === "workout" ? "completed" : "logged"}
          {entry.xpEarned > 0 && <span className="text-emerald-500">+{entry.xpEarned} XP</span>}
        </div>
      </div>
    );
  }

  if (entry.kind === "chat") {
    const fromCoach = entry.senderRole === "coach";
    return (
      <div className={cn("flex", fromCoach ? "justify-start" : "justify-end")}>
        <div
          className={cn(
            "max-w-[85%] rounded-3xl px-5 py-3.5",
            fromCoach
              ? "rounded-bl-lg border border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              : "rounded-br-lg bg-stone-900 text-white"
          )}
        >
          {fromCoach && (
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                aria-hidden
              >
                {coachName.slice(0, 1).toUpperCase()}
              </span>
              {coachName}
            </p>
          )}
          <p className={cn("text-base leading-relaxed", fromCoach ? "text-stone-800" : "text-white")}>{entry.content}</p>
        </div>
      </div>
    );
  }

  const Icon = TYPE_ICON[entry.logType];
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-stone-900 px-5 py-3.5 text-white">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/60">
            <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
            {entry.logType} · {new Date(entry.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-base leading-relaxed">{entry.content}</p>
        </div>
      </div>

      {entry.feedback && (
        <div className="flex justify-start">
          <div
            className="max-w-[85%] rounded-3xl rounded-bl-lg border border-indigo-200/40 bg-white/70 px-5 py-4 backdrop-blur-md"
            style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 12px 32px -12px rgba(99,102,241,0.35)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #4338ca, #6366f1)" }}
                aria-hidden
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <p className="text-xs font-semibold text-indigo-700">
                Coach&apos;s Assistant <span className="font-normal text-stone-400">· grounded in {coachName}&apos;s methodology</span>
              </p>
            </div>
            <p className="mt-2 text-base leading-relaxed text-stone-800">{entry.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
