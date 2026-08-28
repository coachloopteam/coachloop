"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogForm({ token }: { token: string }) {
  const [type, setType] = useState<"meal" | "workout">("meal");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, type, content }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setFeedback(data.feedback);
      setContent("");
      router.refresh();
    } else {
      setFeedback("Something went wrong — try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex gap-2">
        {(["meal", "workout"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              type === t ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"
            }`}
          >
            {t === "meal" ? "Log a meal" : "Log a workout"}
          </button>
        ))}
      </div>
      <textarea
        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        rows={3}
        placeholder={type === "meal" ? "e.g. Grilled chicken, rice, and a banana" : "e.g. 5x5 squats at 80kg, felt strong"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-neutral-900 text-white rounded-lg py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Sending…" : "Submit"}
      </button>

      {feedback && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm">{feedback}</div>
      )}
    </form>
  );
}
