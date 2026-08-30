"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Dumbbell, Sparkles, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { TimelineEntry } from "@/lib/timeline";

const TYPE_ICON = { meal: UtensilsCrossed, workout: Dumbbell } as const;

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// The coach-side half of the same conversation ChatPanel.tsx renders for
// the client — same unified timeline (logs + AI replies, daily_logs
// completions, messages), dark "B2B workspace" theme instead of the
// client portal's light one. Unlike the client side, this runs under a
// real authenticated session, so new messages arrive via a genuine
// Supabase Realtime subscription (RLS-safe, keyed off auth.uid()) rather
// than polling.
export default function CoachChatPanel({
  clientId,
  clientName,
  initialEntries,
}: {
  clientId: string;
  clientName: string;
  initialEntries: TimelineEntry[];
}) {
  const [liveEntries, setLiveEntries] = useState<TimelineEntry[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Supabase Realtime is at-least-once, and React Strict Mode's dev-only
  // double effect-invocation can also briefly run two subscriptions — this
  // guards against a duplicate React key from the same row arriving twice.
  const seenIds = useRef(new Set(initialEntries.filter((e) => e.kind === "chat").map((e) => e.id)));

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          const row = payload.new as { id: string; sender_role: "coach" | "client"; content: string; created_at: string };
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          setLiveEntries((prev) => [
            ...prev,
            { kind: "chat", id: row.id, senderRole: row.sender_role, content: row.content, at: row.created_at },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setContent("");
    const res = await fetch("/api/coach/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, content: trimmed }),
    });
    setSending(false);
    // No optimistic bubble needed here — the Realtime subscription above
    // delivers the real row back within a beat of the insert committing.
    if (!res.ok) setContent(trimmed);
  }

  const groups: { label: string; items: TimelineEntry[] }[] = [];
  for (const e of [...initialEntries, ...liveEntries].reverse()) {
    const label = dayLabel(e.at);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-stone-950 shadow-[0_40px_70px_-24px_rgba(0,0,0,0.6)]">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">Conversation</p>
        <h2 className="mt-0.5 text-lg font-semibold text-white">{clientName}</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {groups.length === 0 && <p className="py-12 text-center text-sm text-white/30">Nothing here yet.</p>}
        {groups.map((g) => (
          <div key={g.label} className="space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-white/30">{g.label}</p>
            {g.items.map((entry) => (
              <TimelineBubble key={`${entry.kind}-${entry.id}`} entry={entry} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
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
            placeholder={`Message ${clientName}…`}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-base text-white placeholder:text-white/30 outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 ease-out active:scale-90 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
          >
            <ArrowUp className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineBubble({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === "completion") {
    const Icon = entry.completionType === "workout" ? Dumbbell : UtensilsCrossed;
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          {entry.label} {entry.completionType === "workout" ? "completed" : "logged"}
          {entry.xpEarned > 0 && <span className="text-emerald-400">+{entry.xpEarned} XP</span>}
        </div>
      </div>
    );
  }

  if (entry.kind === "chat") {
    const fromCoach = entry.senderRole === "coach";
    return (
      <div className={cn("flex", fromCoach ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[80%] rounded-3xl px-5 py-3.5 transition-all duration-500 ease-out",
            fromCoach
              ? "rounded-br-lg text-white"
              : "rounded-bl-lg border border-white/10 bg-white/5 text-white/90"
          )}
          style={fromCoach ? { background: "linear-gradient(135deg, var(--accent), #ff8a65)" } : undefined}
        >
          <p className="text-base leading-relaxed">{entry.content}</p>
        </div>
      </div>
    );
  }

  const Icon = TYPE_ICON[entry.logType];
  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-3xl rounded-bl-lg border border-white/10 bg-white/5 px-5 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
            <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
            {entry.logType} · {new Date(entry.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-base leading-relaxed text-white/90">{entry.content}</p>
        </div>
      </div>

      {entry.feedback && (
        <div className="flex justify-start pl-4">
          <div
            className="max-w-[76%] rounded-3xl rounded-bl-lg border border-indigo-400/20 bg-indigo-500/10 px-5 py-4 backdrop-blur-md"
            style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.15), 0 12px 32px -12px rgba(99,102,241,0.5)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #4338ca, #6366f1)" }}
                aria-hidden
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <p className="text-xs font-semibold text-indigo-300">AI Assistant sent this automatically</p>
            </div>
            <p className="mt-2 text-base leading-relaxed text-white/80">{entry.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
