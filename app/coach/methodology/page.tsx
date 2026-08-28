import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MethodologyForm from "@/components/MethodologyForm";

export default async function MethodologyPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/coach/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("training_philosophy, nutrition_rules, tone, banned_topics")
    .eq("auth_user_id", auth.user.id)
    .single();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your methodology</h1>
          <Link href="/coach" className="text-sm underline text-neutral-600">
            Back to dashboard
          </Link>
        </div>
        <p className="text-sm text-neutral-500">
          This is what the AI reads before responding to any client — it never gives advice outside
          of what you write here.
        </p>
        <MethodologyForm
          initial={{
            training_philosophy: coach?.training_philosophy ?? "",
            nutrition_rules: coach?.nutrition_rules ?? "",
            tone: coach?.tone ?? "supportive, direct, no fluff",
            banned_topics: coach?.banned_topics ?? "",
          }}
        />
      </div>
    </div>
  );
}
