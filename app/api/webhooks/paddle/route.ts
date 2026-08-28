import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// TODO before going live: verify the Paddle-Signature header against
// PADDLE_WEBHOOK_SECRET (see https://developer.paddle.com/webhooks/signature-verification).
// Left unverified for now since the new Product/price IDs in the existing
// Paddle catalog aren't created yet — wire this up once they exist.
export async function POST(req: NextRequest) {
  const event = await req.json();
  const supabase = createAdminClient();

  const customerId: string | undefined = event.data?.customer_id;
  const subscriptionId: string | undefined = event.data?.id;

  switch (event.event_type) {
    case "subscription.activated":
    case "subscription.trialing":
    case "subscription.past_due":
    case "subscription.canceled": {
      const statusMap: Record<string, string> = {
        "subscription.activated": "active",
        "subscription.trialing": "trialing",
        "subscription.past_due": "past_due",
        "subscription.canceled": "canceled",
      };
      if (customerId) {
        await supabase
          .from("coaches")
          .update({
            subscription_status: statusMap[event.event_type],
            paddle_customer_id: customerId,
            paddle_subscription_id: subscriptionId,
          })
          .eq("paddle_customer_id", customerId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
