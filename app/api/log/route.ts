import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateFeedback } from "@/lib/ai";

// Public endpoint hit by the client portal (/c/[token]). No Supabase Auth
// session exists here — the invite token IS the credential, validated
// server-side against the service role client before touching any data.
export async function POST(req: NextRequest) {
  const { token, type, content } = await req.json();

  if (!token || !type || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (type !== "meal" && type !== "workout") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
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

  const { data: coach } = await supabase
    .from("coaches")
    .select("training_philosophy, nutrition_rules, tone, banned_topics")
    .eq("id", client.coach_id)
    .single();

  const { data: recentLogs } = await supabase
    .from("logs")
    .select("type, content, logged_at")
    .eq("client_id", client.id)
    .order("logged_at", { ascending: false })
    .limit(5);

  const { data: newLog, error: insertError } = await supabase
    .from("logs")
    .insert({ client_id: client.id, type, content })
    .select()
    .single();

  if (insertError || !newLog) {
    return NextResponse.json({ error: "Could not save log" }, { status: 500 });
  }

  await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("id", client.id)
    .eq("status", "invited");

  let feedback = "Logged! Your coach will follow up.";
  let flagged = false;

  try {
    const result = await generateFeedback({
      methodology: {
        training_philosophy: coach?.training_philosophy ?? "",
        nutrition_rules: coach?.nutrition_rules ?? "",
        tone: coach?.tone ?? "",
        banned_topics: coach?.banned_topics ?? "",
      },
      recentLogs: recentLogs ?? [],
      newEntry: { type, content },
    });
    feedback = result.feedback;
    flagged = result.flagged;
  } catch (err) {
    console.error("AI feedback generation failed:", err);
    // Fall through with the default message so the client's log still saves.
  }

  await supabase.from("ai_feedback").insert({
    log_id: newLog.id,
    client_id: client.id,
    feedback,
    flagged,
  });

  return NextResponse.json({ feedback, flagged });
}
