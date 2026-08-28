import { NextRequest, NextResponse } from "next/server";
import { EventName, type SubscriptionNotification } from "@paddle/paddle-node-sdk";
import { getPaddleClient } from "@/lib/paddle-server";
import { createAdminClient } from "@/lib/supabase/admin";

// Needs Node's crypto for signature verification — never run this on the
// edge runtime.
export const runtime = "nodejs";

const SUBSCRIPTION_EVENTS = new Set<string>([
  EventName.SubscriptionCreated,
  EventName.SubscriptionUpdated,
  EventName.SubscriptionActivated,
  EventName.SubscriptionTrialing,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionPaused,
  EventName.SubscriptionResumed,
  EventName.SubscriptionCanceled,
]);

export async function POST(req: NextRequest) {
  // Paddle signs the exact raw request bytes — read the body as text and
  // hand that raw string to unmarshal(). Calling req.json() first (or
  // anything else that consumes the stream) breaks verification, since the
  // signature won't match a re-serialized body.
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Expected until the live sandbox notification destination exists and
    // its signing secret is dropped into env — fail loudly rather than
    // silently accepting unverified webhooks.
    console.error("Paddle webhook received but PADDLE_WEBHOOK_SECRET is not set — refusing to process.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle-Signature header" }, { status: 400 });
  }

  let event;
  try {
    event = await getPaddleClient().webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error("Paddle webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!event) {
    // unmarshal() returns undefined for an event type this SDK version
    // doesn't model yet (Paddle adds new ones over time) — ack it so Paddle
    // stops retrying; there's nothing for us to act on regardless.
    return NextResponse.json({ received: true });
  }

  if (SUBSCRIPTION_EVENTS.has(event.eventType)) {
    try {
      await syncSubscriptionStatus(event.data as SubscriptionNotification);
    } catch (err) {
      console.error("Failed to sync subscription status:", err);
      // Non-2xx tells Paddle to retry the delivery instead of silently
      // dropping a status change.
      return NextResponse.json({ error: "Failed to process event" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

// Paddle's subscription `status` is the source of truth for access control —
// trust it directly instead of re-deriving state from the event name, so
// created/updated/resumed/imported are all handled by the same code path.
async function syncSubscriptionStatus(subscription: SubscriptionNotification) {
  const supabase = createAdminClient();

  // Our subscription_status check constraint only has
  // trialing/active/past_due/canceled (see supabase/schema.sql) — Paddle's
  // 'paused' has no dedicated slot yet, so it's treated as canceled since
  // either way the coach loses access. Worth a real 'paused' state later if
  // the product needs to tell "paused, can self-resume" apart from
  // "canceled" in the UI.
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    paused: "canceled",
  };
  const subscriptionStatus = statusMap[subscription.status] ?? "canceled";

  const update = {
    subscription_status: subscriptionStatus,
    paddle_customer_id: subscription.customerId,
    paddle_subscription_id: subscription.id,
  };

  // The first event for a coach carries our internal coach id in
  // custom_data (set at Checkout.open() time — see
  // components/UpgradeButton.tsx), which is the only reliable way to find
  // the right row before paddle_customer_id has ever been stored. Later
  // events fall back to matching on paddle_customer_id.
  const coachId = (subscription.customData as { coach_id?: string } | null)?.coach_id;

  const query = coachId
    ? supabase.from("coaches").update(update).eq("id", coachId)
    : supabase.from("coaches").update(update).eq("paddle_customer_id", subscription.customerId);

  const { data, error } = await query.select("id");
  if (error) throw error;

  if (!data?.length) {
    // Not a failure Paddle should retry forever over — log it for manual
    // follow-up rather than throwing, since retrying won't make a matching
    // coach row appear.
    console.error(
      `Paddle webhook: no coach row matched (coach_id=${coachId ?? "none"}, paddle_customer_id=${subscription.customerId}). Subscription ${subscription.id} status not synced.`
    );
  }
}
