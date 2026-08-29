"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {(["meal", "workout"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                type === t
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              )}
            >
              {t === "meal" ? "Log a meal" : "Log a workout"}
            </button>
          ))}
        </div>
        <Textarea
          rows={3}
          placeholder={type === "meal" ? "e.g. Grilled chicken, rice, and a banana" : "e.g. 5x5 squats at 80kg, felt strong"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Submit"}
        </Button>

        {feedback && (
          <div className="animate-fade-in rounded-xl border border-stone-100 bg-stone-50 p-3 text-sm text-stone-700">
            {feedback}
          </div>
        )}
      </form>
    </Card>
  );
}
