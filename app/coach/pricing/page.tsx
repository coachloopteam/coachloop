import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PricingCards from "@/components/PricingCards";
import { buttonClasses } from "@/components/ui/Button";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/coach/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("auth_user_id", auth.user.id)
    .single();
  if (!coach) redirect("/coach/login");

  const h = await headers();
  const country = h.get("x-vercel-ip-country") ?? "OTHERS";

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Billing</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-stone-900">Plans</h1>
          </div>
          <Link href="/coach" className={buttonClasses("ghost")}>
            ← Back to dashboard
          </Link>
        </div>
        <PricingCards coachId={coach.id} customerEmail={auth.user.email} country={country} />
      </div>
    </div>
  );
}
