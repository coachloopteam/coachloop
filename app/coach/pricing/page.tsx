import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PricingCards from "@/components/PricingCards";

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
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Plans</h1>
          <Link href="/coach" className="text-sm underline text-neutral-600">
            Back to dashboard
          </Link>
        </div>
        <PricingCards coachId={coach.id} customerEmail={auth.user.email} country={country} />
      </div>
    </div>
  );
}
