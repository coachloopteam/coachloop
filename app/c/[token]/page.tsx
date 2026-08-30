import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, KeyRound, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import TodaysWorkouts from "@/components/TodaysWorkouts";
import TodaysRecipes from "@/components/TodaysRecipes";
import DailyChallenge from "@/components/DailyChallenge";
import ChatPanel, { type TimelineEntry } from "@/components/ChatPanel";
import { pickDailyChallengeId } from "@/lib/dailyChallenge";

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

  const messageEntries: TimelineEntry[] = (history ?? []).map((h) => {
    const fb = Array.isArray(h.ai_feedback) ? h.ai_feedback[0] : h.ai_feedback;
    return {
      kind: "message",
      id: h.id,
      logType: h.type as "meal" | "workout",
      content: h.content,
      at: h.logged_at,
      feedback: fb?.feedback ?? null,
    };
  });

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

  // Workout/recipe completions (from TodaysWorkouts / TodaysRecipes / the
  // Daily Challenge — all backed by daily_logs) fold into the same
  // conversation timeline as free-text messages, so the chat reads as one
  // unified activity + communication stream rather than two disconnected
  // feeds. See components/ChatPanel.tsx.
  const { data: completionHistory } = await supabase
    .from("daily_logs")
    .select("id, xp_earned, created_at, workouts(title), recipes(title)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(10);

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

  const timeline = [...messageEntries, ...completionEntries].sort((a, b) => (a.at < b.at ? 1 : -1));

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

        <DailyChallenge token={token} workout={challengeWorkout} completed={challengeCompleted} />

        {otherWorkouts.length > 0 && (
          <TodaysWorkouts token={token} workouts={otherWorkouts} completedWorkoutIds={completedWorkoutIds} />
        )}

        {recipes && recipes.length > 0 && (
          <TodaysRecipes token={token} recipes={recipes} loggedRecipeIds={loggedRecipeIds} />
        )}

        <ChatPanel
          token={token}
          coachName={coachName}
          entries={timeline}
          workouts={(workouts ?? []).map((w) => ({ id: w.id, title: w.title }))}
          recipes={(recipes ?? []).map((r) => ({ id: r.id, title: r.title }))}
        />

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
