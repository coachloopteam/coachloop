import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint hit by the client portal (/c/[token]). Same tokenless
// pattern as app/api/log/route.ts: no Supabase Auth session exists here —
// the invite token IS the credential, validated server-side against the
// service role client before touching any data.
//
// This is a DIFFERENT concern from /api/log: that route saves free-text
// meal/workout notes and runs them through the AI-feedback pipeline. This
// route logs a structured completion of a catalog workout/recipe (from the
// new `workouts` / `recipes` tables in supabase/schema_v2_proposed.sql) and
// exists purely to drive XP/streak — no AI feedback involved.
//
// NOTE: this route depends on tables (daily_logs, workouts, recipes,
// client_gamification, coach_gamification) that only exist in the proposed
// schema — it will fail at runtime until that migration is applied.

// XP is decided here, never trusted from the request body — a client-
// supplied xp value would be a trivial way to inflate your own score.
// Recipes are informational-only (matches the existing RecipeCarousel
// behavior — "suggestions only, not a checkable task"), so a recipe-only
// log earns 0 XP; only a workout completion earns XP.
const WORKOUT_XP_REWARD = 20;

export async function POST(req: NextRequest) {
  const { token, workoutId, recipeId } = await req.json();

  if (!token || (!workoutId && !recipeId)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, coach_id")
    .eq("invite_token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  // Confirm the workout/recipe is actually visible to this client — either
  // a shared/global catalog item (coach_id null) or one belonging to their
  // own assigned coach. Prevents logging another coach's private content.
  if (workoutId) {
    const { data: workout } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", workoutId)
      .or(`coach_id.is.null,coach_id.eq.${client.coach_id}`)
      .maybeSingle();

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }
  }

  if (recipeId) {
    const { data: recipe } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .or(`coach_id.is.null,coach_id.eq.${client.coach_id}`)
      .maybeSingle();

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
  }

  const xpEarned = workoutId ? WORKOUT_XP_REWARD : 0;

  const { error: insertError } = await supabase.from("daily_logs").insert({
    client_id: client.id,
    workout_id: workoutId ?? null,
    recipe_id: recipeId ?? null,
    xp_earned: xpEarned,
  });

  if (insertError) {
    // Postgres unique_violation — the one-workout-per-day index already
    // caught this, so treat it as "already logged" rather than a failure.
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Already logged today" }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not save log" }, { status: 500 });
  }

  await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("id", client.id)
    .eq("status", "invited");

  // The insert trigger (handle_daily_log_gamification) has already updated
  // client_gamification by this point — read it back so the client can
  // update its XP/streak header immediately, no second round trip needed.
  const { data: gamification } = await supabase
    .from("client_gamification")
    .select("current_streak, total_xp")
    .eq("client_id", client.id)
    .single();

  return NextResponse.json({
    xpEarned,
    currentStreak: gamification?.current_streak ?? 0,
    totalXp: gamification?.total_xp ?? 0,
  });
}
