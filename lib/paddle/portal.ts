"use server";

import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle-server";

type PortalResult = { url: string } | { error: string };

export async function createPortalSession(): Promise<PortalResult> {
  // 1. Authenticate first — reject before any DB query or Paddle API call.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { error: "Not authenticated" };
  }

  // 2. Resolve the signed-in coach's Paddle customer_id server-side. This
  //    query runs against the cookie-scoped (RLS-respecting) client, so even
  //    a bug here can't leak another coach's row — "coach reads own
  //    customer row" in supabase/schema.sql enforces it independently. There
  //    is no client-supplied customer id anywhere in this action.
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("auth_user_id", auth.user.id)
    .single();
  if (!coach) {
    return { error: "No coach account" };
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("customer_id")
    .eq("coach_id", coach.id)
    .single();
  if (!customer?.customer_id) {
    // No Paddle customer yet — this coach has never completed a checkout.
    return { error: "No Paddle customer — subscribe first" };
  }

  // 3. Active subscription ids, so the portal response includes
  //    per-subscription deep links (cancel, update payment method) even
  //    though this action only redirects to the general overview today.
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("subscription_id")
    .eq("customer_id", customer.customer_id);
  const subscriptionIds = (subs ?? []).map((s) => s.subscription_id);

  // 4. Mint the session and return ONLY the redirect URL — the full session
  //    object carries the customer_id and the deep-link table, which the
  //    client has no need for. Never cache this URL; it's one-time use.
  try {
    const paddle = getPaddleClient();
    const session = await paddle.customerPortalSessions.create(customer.customer_id, subscriptionIds);
    return { url: session.urls.general.overview };
  } catch (err) {
    console.error("Failed to create Paddle customer portal session:", err);
    return { error: "Could not open billing portal" };
  }
}
