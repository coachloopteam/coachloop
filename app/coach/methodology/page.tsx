import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MethodologyForm from "@/components/MethodologyForm";
import { buttonClasses } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Settings</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-stone-900">Your methodology</h1>
          </div>
          <Link href="/coach" className={buttonClasses("ghost")}>
            ← Back to dashboard
          </Link>
        </div>
        <p className="animate-fade-in-up text-sm leading-relaxed text-stone-500">
          This is what the AI reads before responding to any client — it never gives advice outside
          of what you write here.
        </p>
        <div className="animate-fade-in-up">
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
    </div>
  );
}
