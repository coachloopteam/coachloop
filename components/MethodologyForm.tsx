"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    training_philosophy: string;
    nutrition_rules: string;
    tone: string;
    banned_topics: string;
  };
};

export default function MethodologyForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/coach/methodology", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, rows = 3) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        rows={rows}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-neutral-200 rounded-xl p-6">
      {field(
        "training_philosophy",
        "Training philosophy",
        "e.g. Full-body strength 3x/week, progressive overload, prioritize compound lifts, deload every 6th week…"
      )}
      {field(
        "nutrition_rules",
        "Nutrition rules",
        "e.g. Whole-food first, protein target 1.6g/kg, no strict calorie counting for beginners…"
      )}
      {field("tone", "Voice / tone", "e.g. Supportive but direct, no fluff, occasional humor", 2)}
      {field("banned_topics", "Topics to avoid", "e.g. Don't discuss supplements, don't give medical advice", 2)}

      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save methodology"}
      </button>
      {saved && <span className="ml-3 text-sm text-green-600">Saved.</span>}
    </form>
  );
}
