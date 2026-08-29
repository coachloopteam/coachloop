import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findTierByPriceId } from "@/lib/pricing-tiers";
import { statusGrantsAccess } from "@/lib/paddle/access";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/coach/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("auth_user_id", auth.user.id)
    .single();
  if (!coach) redirect("/coach/login");

  const { data: customer } = await supabase
    .from("customers")
    .select("customer_id, email")
    .eq("coach_id", coach.id)
    .maybeSingle();

  const { data: subscription } = customer
    ? await supabase
        .from("subscriptions")
        .select("status, price_id, scheduled_change_action, scheduled_change_at")
        .eq("customer_id", customer.customer_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const tier = subscription ? findTierByPriceId(subscription.price_id) : undefined;
  const hasAccess = subscription ? statusGrantsAccess(subscription.status) : false;

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Settings</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-stone-900">Account & billing</h1>
          </div>
          <Link href="/coach" className={buttonClasses("ghost")}>
            ← Back to dashboard
          </Link>
        </div>

        <Card className="animate-fade-in-up p-6">
          {!subscription ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-500">You don&apos;t have a subscription yet.</p>
              <Link href="/coach/pricing" className={buttonClasses("accent")}>
                View plans
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-stone-900">{tier?.name ?? "Subscription"} plan</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={hasAccess ? "success" : "danger"}>{subscription.status}</Badge>
                  {subscription.scheduled_change_action && subscription.scheduled_change_at && (
                    <span className="text-xs text-stone-500">
                      {subscription.scheduled_change_action} on{" "}
                      {new Date(subscription.scheduled_change_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <ManageSubscriptionButton />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
