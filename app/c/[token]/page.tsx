import { notFound } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Flame, KeyRound, Sparkles, UtensilsCrossed } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import LogButtons from "@/components/LogButtons";
import TodaysWorkouts from "@/components/TodaysWorkouts";
import TodaysRecipes from "@/components/TodaysRecipes";
import DailyChallenge from "@/components/DailyChallenge";
import { pickDailyChallengeId } from "@/lib/dailyChallenge";

type LogEntry = {
  id: string;
  type: string;
  content: string;
  logged_at: string;
  feedback: string | null;
};

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function groupByDay(entries: LogEntry[]): { label: string; entries: LogEntry[] }[] {
  const groups: { label: string; entries: LogEntry[] }[] = [];
  for (const entry of entries) {
    const label = dayLabel(entry.logged_at);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}

const TYPE_ICON: Record<string, typeof UtensilsCrossed> = { meal: UtensilsCrossed, workout: Dumbbell };

export default async function ClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, coach_id, auth_user_id, coaches(name, business_name)")
    .eq("invite_token", token)
    .single();

  if (!client) notFound();

  const coach = Array.isArray(client.coaches) ? client.coaches[0] : client.coaches;
  const coachName = coach?.business_name || coach?.name || "your coach";
  const firstName = client.name.split(" ")[0];

  const { data: history } = await supabase
    .from("logs")
    .select("id, type, content, logged_at, ai_feedback(feedback)")
    .eq("client_id", client.id)
    .order("logged_at", { ascending: false })
    .limit(10);

  const entries: LogEntry[] = (history ?? []).map((h) => {
    const fb = Array.isArray(h.ai_feedback) ? h.ai_feedback[0] : h.ai_feedback;
    return { id: h.id, type: h.type, content: h.content, logged_at: h.logged_at, feedback: fb?.feedback ?? null };
  });
  const groups = groupByDay(entries);

  // Catalog content visible to this client: the shared/global library
  // (coach_id null) plus anything their own coach has added. See
  // supabase/schema_v2_proposed.sql — daily_logs/workouts/recipes/client_gamification.
  const catalogFilter = client.coach_id ? `coach_id.is.null,coach_id.eq.${client.coach_id}` : "coach_id.is.null";
  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, title, discipline_type, detail, duration_minutes")
    .or(catalogFilter)
    .order("created_at", { ascending: true })
    .limit(6);

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, calories, high_calorie, nutrient_dense, gluten_free, lactose_free")
    .or(catalogFilter)
    .order("created_at", { ascending: true })
    .limit(6);

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayLogs } = await supabase
    .from("daily_logs")
    .select("workout_id, recipe_id")
    .eq("client_id", client.id)
    .eq("log_date", today);
  const completedWorkoutIds = (todayLogs ?? []).flatMap((l) => (l.workout_id ? [l.workout_id as string] : []));
  const loggedRecipeIds = (todayLogs ?? []).flatMap((l) => (l.recipe_id ? [l.recipe_id as string] : []));

  // One workout is deterministically featured as "Today's Challenge" (see
  // lib/dailyChallenge.ts) and earns bonus XP when completed — computed
  // from the same candidate list /api/daily-log uses, so the two agree.
  const challengeId = pickDailyChallengeId((workouts ?? []).map((w) => w.id));
  const challengeWorkout = (workouts ?? []).find((w) => w.id === challengeId) ?? null;
  const otherWorkouts = (workouts ?? []).filter((w) => w.id !== challengeId);
  const challengeCompleted = challengeId ? completedWorkoutIds.includes(challengeId) : false;

  const { data: gamification } = await supabase
    .from("client_gamification")
    .select("current_streak, total_xp")
    .eq("client_id", client.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* A friendly opener, styled like the first message in a chat rather
            than a page title — sets the "conversation, not a form" tone. */}
        <div className="animate-fade-in-up flex justify-start">
          <div className="max-w-[85%] rounded-3xl rounded-bl-lg border border-stone-100 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-base leading-relaxed text-stone-800">
              Hey {firstName}, ready for today? Coached by <span className="font-semibold">{coachName}</span>.
            </p>
            {gamification && (gamification.current_streak > 0 || gamification.total_xp > 0) && (
              <p className="mt-2 flex items-center gap-3 text-sm font-semibold text-stone-500">
                <span className="flex items-center gap-1 text-amber-600">
                  <Flame className="h-4 w-4 fill-amber-400" strokeWidth={1.5} aria-hidden />
                  {gamification.current_streak}-day streak
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {gamification.total_xp} XP
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="animate-fade-in-up">
          <LogButtons token={token} />
        </div>

        <DailyChallenge token={token} workout={challengeWorkout} completed={challengeCompleted} />

        {otherWorkouts.length > 0 && (
          <TodaysWorkouts token={token} workouts={otherWorkouts} completedWorkoutIds={completedWorkoutIds} />
        )}

        {recipes && recipes.length > 0 && (
          <TodaysRecipes token={token} recipes={recipes} loggedRecipeIds={loggedRecipeIds} />
        )}

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-stone-400">
                {group.label}
              </p>
              {group.entries.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  {/* The client's own log — an outgoing message. */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-stone-900 px-5 py-3.5 text-white">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/60">
                        {(() => {
                          const Icon = TYPE_ICON[entry.type] ?? UtensilsCrossed;
                          return <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />;
                        })()}
                        {entry.type} · {new Date(entry.logged_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                      <p className="mt-1 text-base leading-relaxed">{entry.content}</p>
                    </div>
                  </div>

                  {/* Coach's feedback — an elegant reply bubble. */}
                  {entry.feedback && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-3xl rounded-bl-lg border border-stone-100 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                            aria-hidden
                          >
                            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                          <p className="text-xs font-semibold text-stone-500">
                            Coach&apos;s Feedback{" "}
                            <span className="font-normal text-stone-400">
                              · Grounded in {coachName}&apos;s methodology
                            </span>
                          </p>
                        </div>
                        <p className="mt-2 text-base leading-relaxed text-stone-800">{entry.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {!client.auth_user_id && (
          <Link
            href={`/coach/login?role=client&token=${token}`}
            className="flex items-center justify-center gap-2 rounded-full border border-dashed border-stone-200 px-4 py-3 text-sm font-medium text-stone-400 transition-colors duration-200 hover:border-stone-300 hover:text-stone-600"
          >
            <KeyRound className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Save your login, so you don&apos;t need this link next time
          </Link>
        )}
      </div>
    </div>
  );
}
