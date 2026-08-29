"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="flex items-center gap-3 border-t border-stone-100 pt-5">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save methodology"}
          </Button>
          {saved && <span className="animate-fade-in text-sm font-medium text-emerald-600">Saved.</span>}
        </div>
      </form>
    </Card>
  );
}
