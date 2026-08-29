import { NextRequest, NextResponse } from "next/server";
import { getPaddleClient } from "@/lib/paddle-server";
import { processEvent } from "@/lib/paddle/process-webhook";

// Needs Node's crypto for signature verification — never run this on the
// edge runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature");
  // Paddle signs the exact raw request bytes — read the body as text and
  // hand that raw string to unmarshal(). Calling req.json() first (or
  // anything else that consumes the stream) breaks verification, since the
  // signature won't match a re-serialized body.
  const rawBody = await req.text();

  if (!signature || !rawBody) {
    return NextResponse.json({ error: "Missing signature or body" }, { status: 400 });
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Paddle webhook received but PADDLE_WEBHOOK_SECRET is not set — refusing to process.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    // Throws on signature mismatch, expired timestamp, or malformed body —
    // caught below by the same catch as any handler failure. Don't split
    // "signature failure" from "handler failure" into different status
    // codes: unmarshal() can't distinguish a tampered request from a
    // rotated-but-not-yet-redeployed secret, so there's nothing meaningful
    // to split on. Every branch below returns a single non-2xx so Paddle
    // retries — the one response that would lose the event is a 2xx.
    const event = await getPaddleClient().webhooks.unmarshal(rawBody, webhookSecret, signature);

    if (event) {
      await processEvent(event);
    }
    // event === undefined means the SDK doesn't model this event type yet —
    // nothing to process, but the delivery itself was verified fine.

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook processing failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
