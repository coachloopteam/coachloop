import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CoachChatPanel from "@/components/CoachChatPanel";
import type { TimelineEntry } from "@/lib/timeline";

// The coach's half of the same conversation the client sees at
// /c/[token] — dark "B2B workspace" theme. Uses the coach's own
// authenticated session (not the admin client): RLS confirms this client
// actually belongs to them on every query below, so there's no separate
// ownership check needed beyond "the row came back at all".
export default async function CoachClientThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/coach/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: history } = await supabase
    .from("logs")
    .select("id, type, content, logged_at, ai_feedback(feedback)")
    .eq("client_id", client.id)
    .order("logged_at", { ascending: false })
    .limit(20);

  const logEntries: TimelineEntry[] = (history ?? []).map((h) => {
    const fb = Array.isArray(h.ai_feedback) ? h.ai_feedback[0] : h.ai_feedback;
    return {
      kind: "log",
      id: h.id,
      logType: h.type as "meal" | "workout",
      content: h.content,
      at: h.logged_at,
      feedback: fb?.feedback ?? null,
    };
  });

  const { data: completionHistory } = await supabase
    .from("daily_logs")
    .select("id, xp_earned, created_at, workouts(title), recipes(title)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const completionEntries: TimelineEntry[] = (completionHistory ?? []).map((c) => {
    const workout = Array.isArray(c.workouts) ? c.workouts[0] : c.workouts;
    const recipe = Array.isArray(c.recipes) ? c.recipes[0] : c.recipes;
    return {
      kind: "completion",
      id: c.id,
      label: workout?.title ?? recipe?.title ?? "Activity",
      xpEarned: c.xp_earned,
      completionType: workout ? "workout" : "recipe",
      at: c.created_at,
    };
  });

  const { data: messageHistory } = await supabase
    .from("messages")
    .select("id, sender_role, content, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const chatEntries: TimelineEntry[] = (messageHistory ?? []).map((m) => ({
    kind: "chat",
    id: m.id,
    senderRole: m.sender_role as "coach" | "client",
    content: m.content,
    at: m.created_at,
  }));

  const timeline = [...logEntries, ...completionEntries, ...chatEntries].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-8 sm:py-10">
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-2xl flex-col">
        <Link
          href="/coach"
          className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Back to dashboard
        </Link>

        <CoachChatPanel clientId={client.id} clientName={client.name} initialEntries={timeline} />
      </div>
    </div>
  );
}
