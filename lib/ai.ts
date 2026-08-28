import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Methodology = {
  training_philosophy: string;
  nutrition_rules: string;
  tone: string;
  banned_topics: string;
};

export type RecentLog = {
  type: "meal" | "workout";
  content: string;
  logged_at: string;
};

/**
 * Generates feedback for one new log entry, strictly grounded in the coach's
 * own methodology. Kept to a single call per entry to stay cheap and fast.
 */
export async function generateFeedback({
  methodology,
  recentLogs,
  newEntry,
}: {
  methodology: Methodology;
  recentLogs: RecentLog[];
  newEntry: { type: "meal" | "workout"; content: string };
}): Promise<{ feedback: string; flagged: boolean }> {
  const system = `You are a coaching assistant that speaks ONLY on behalf of a specific human coach.
You must follow the coach's methodology below exactly — do not introduce outside training or nutrition
advice that conflicts with it, and do not give medical advice. If the client's entry raises a real
safety concern (injury, chest pain, disordered eating signals, etc.), say to flag it for the coach
directly rather than trying to resolve it yourself, and set flagged=true.

Coach's training philosophy: ${methodology.training_philosophy || "(not specified yet)"}
Coach's nutrition rules: ${methodology.nutrition_rules || "(not specified yet)"}
Coach's tone for client-facing messages: ${methodology.tone || "supportive, direct, no fluff"}
Topics the coach does not want you discussing: ${methodology.banned_topics || "(none specified)"}

Respond with 2-4 short sentences, directly to the client, in the coach's tone. Then on a new line
output exactly "FLAGGED: true" or "FLAGGED: false".`;

  const historyText = recentLogs
    .slice(-5)
    .map((l) => `- [${l.type} @ ${l.logged_at}] ${l.content}`)
    .join("\n") || "(no prior logs)";

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system,
    messages: [
      {
        role: "user",
        content: `Client's recent history:\n${historyText}\n\nNew ${newEntry.type} entry: ${newEntry.content}`,
      },
    ],
  });

  const raw = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();

  const flagged = /FLAGGED:\s*true/i.test(raw);
  const feedback = raw.replace(/FLAGGED:\s*(true|false)/i, "").trim();

  return { feedback, flagged };
}
