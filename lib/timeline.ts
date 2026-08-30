// Shared timeline entry shape between the client's ChatPanel and the
// coach's CoachChatPanel — one unified conversation: free-text logs + AI
// replies, real workout/recipe completions (daily_logs), and now real
// human-authored chat messages (messages).
export type TimelineEntry =
  | { kind: "log"; id: string; logType: "meal" | "workout"; content: string; at: string; feedback: string | null }
  | { kind: "completion"; id: string; label: string; xpEarned: number; completionType: "workout" | "recipe"; at: string }
  | { kind: "chat"; id: string; senderRole: "coach" | "client"; content: string; at: string };
