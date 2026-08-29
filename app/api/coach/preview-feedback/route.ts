import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFeedback } from "@/lib/ai";

// A realistic client message to preview against — not tied to any real
// client's data, just a fixed example the coach's current (possibly
// unsaved) methodology settings are run against.
const SAMPLE_ENTRY = {
  type: "meal" as const,
  content: "Had a rough day, skipped my workout and ate a whole pizza. Feeling pretty guilty about it.",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { training_philosophy, nutrition_rules, tone, banned_topics } = await req.json();

  try {
    const { feedback } = await generateFeedback({
      methodology: {
        training_philosophy: training_philosophy || "",
        nutrition_rules: nutrition_rules || "",
        tone: tone || "",
        banned_topics: banned_topics || "",
      },
      recentLogs: [],
      newEntry: SAMPLE_ENTRY,
    });
    return NextResponse.json({ feedback, sample: SAMPLE_ENTRY.content });
  } catch {
    // Most likely cause locally: ANTHROPIC_API_KEY isn't set. Surface this
    // honestly rather than showing a fake canned response.
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet, so a live preview isn't available." },
      { status: 503 }
    );
  }
}
