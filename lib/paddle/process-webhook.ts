import {
  EventName,
  type EventEntity,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionCanceledEvent,
  type CustomerCreatedEvent,
  type CustomerUpdatedEvent,
  type TransactionCompletedEvent,
} from "@paddle/paddle-node-sdk";
import { createAdminClient } from "@/lib/supabase/admin";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;
type SubscriptionEvent = SubscriptionCreatedEvent | SubscriptionUpdatedEvent | SubscriptionCanceledEvent;
type CustomerEvent = CustomerCreatedEvent | CustomerUpdatedEvent;

// Paddle delivers at-least-once and out of order — the same event.eventId
// can arrive more than once, and subscription.updated can arrive before the
// subscription.created for the same subscription. Every handler below is
// written as an idempotent UPSERT keyed on the Paddle resource id, so
// re-processing (or out-of-order processing) converges on the same state
// rather than duplicating rows or requiring an ordering guarantee.
export async function processEvent(event: EventEntity) {
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
      return handleSubscription(event);
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      return handleCustomer(event);
    case EventName.TransactionCompleted:
      return handleTransactionCompleted(event);
    default:
      // Subscribed to (or the SDK models) an event type we don't act on —
      // no-op rather than throw, so Paddle doesn't retry it forever.
      return;
  }
}

async function handleSubscription(event: SubscriptionEvent) {
  const supabase = createAdminClient();
  const sub = event.data;
  const item = sub.items[0];
  // Set at Checkout.open() time (see components/PricingCards.tsx) and
  // carried on every subsequent event for this subscription — the only
  // reliable way to link a Paddle customer back to a coach on the very
  // first event, before any customer.created delivery has arrived.
  const coachId = (sub.customData as { coach_id?: string } | null)?.coach_id;

  // subscriptions.customer_id has a FK to customers — ensure the row exists
  // first, since delivery order isn't guaranteed and this event can arrive
  // before customer.created. PostgREST upsert only touches columns present
  // in the payload, so omitting `email` here (owned by handleCustomer) and
  // omitting `coach_id` when we don't have one leaves those columns exactly
  // as they were on conflict — a later or earlier delivery can never
  // clobber a value the other handler already set.
  const customerUpsert: Record<string, unknown> = {
    customer_id: sub.customerId,
    updated_at: new Date().toISOString(),
  };
  if (coachId) customerUpsert.coach_id = coachId;
  const { error: customerError } = await supabase
    .from("customers")
    .upsert(customerUpsert, { onConflict: "customer_id" });
  if (customerError) throw customerError;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      subscription_id: sub.id,
      customer_id: sub.customerId,
      status: sub.status,
      price_id: item?.price?.id ?? "",
      product_id: item?.price?.productId ?? "",
      scheduled_change_action: sub.scheduledChange?.action ?? null,
      scheduled_change_at: sub.scheduledChange?.effectiveAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscription_id" }
  );
  if (error) throw error;

  await syncLegacyCoachFields(supabase, coachId, sub.customerId, sub.id, sub.status);
}

async function handleCustomer(event: CustomerEvent) {
  const supabase = createAdminClient();
  const customer = event.data;

  // Owns `email` only — never touches coach_id, so it can't clobber what
  // handleSubscription set from custom_data.
  const { error } = await supabase.from("customers").upsert(
    {
      customer_id: customer.id,
      email: customer.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "customer_id" }
  );
  if (error) throw error;
}

async function handleTransactionCompleted(event: TransactionCompletedEvent) {
  const supabase = createAdminClient();
  const txn = event.data;
  const total = txn.details?.totals?.total ?? null;

  const { error } = await supabase.from("transactions").upsert(
    {
      transaction_id: txn.id,
      customer_id: txn.customerId,
      subscription_id: txn.subscriptionId,
      status: txn.status,
      currency_code: txn.currencyCode,
      total_amount: total,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "transaction_id" }
  );
  if (error) throw error;
}

// coaches.subscription_status only has a CHECK for trialing/active/past_due/
// canceled — Paddle's 'paused' (and any future status this map hasn't seen)
// has no dedicated slot, so it collapses to 'canceled' since either way the
// coach loses access. This mirrors the legacy column's original mapping
// exactly; it is NOT the access decision (see lib/paddle/access.ts) — the
// richer `subscriptions.status` column above always stores Paddle's status
// verbatim, unmapped.
const LEGACY_STATUS_MAP: Record<string, string> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
};

// Back-compat: app/coach/page.tsx still reads coaches.subscription_status
// directly for the dashboard's plan card, predating the
// customers/subscriptions tables above.
// Keeping this in sync here (same event, same handler pass) means there's
// exactly one write path per event and no risk of the two mirrors drifting
// apart from independently-triggered syncs.
async function syncLegacyCoachFields(
  supabase: SupabaseAdmin,
  coachId: string | undefined,
  customerId: string,
  subscriptionId: string,
  status: string
) {
  const update = {
    subscription_status: LEGACY_STATUS_MAP[status] ?? "canceled",
    paddle_customer_id: customerId,
    paddle_subscription_id: subscriptionId,
  };

  const query = coachId
    ? supabase.from("coaches").update(update).eq("id", coachId)
    : supabase.from("coaches").update(update).eq("paddle_customer_id", customerId);

  const { data, error } = await query.select("id");
  if (error) throw error;

  if (!data?.length) {
    // Not a failure Paddle should retry forever over — log for manual
    // follow-up rather than throwing, since retrying won't make a matching
    // coach row appear.
    console.error(
      `Paddle webhook: no coach row matched (coach_id=${coachId ?? "none"}, paddle_customer_id=${customerId}). Subscription ${subscriptionId} status not synced to coaches.`
    );
  }
}
