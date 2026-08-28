import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let paddleClient: Paddle | null = null;

/**
 * Server-side Paddle SDK client — used to verify webhook signatures (and,
 * later, for any server-initiated Paddle API calls). Built lazily so that
 * `next build` never fails just because PADDLE_API_KEY isn't set yet: the
 * key is only read by resource calls this app doesn't make yet, not by
 * webhook signature verification, which is keyed off PADDLE_WEBHOOK_SECRET
 * instead (see app/api/webhooks/paddle/route.ts).
 */
export function getPaddleClient(): Paddle {
  if (!paddleClient) {
    paddleClient = new Paddle(process.env.PADDLE_API_KEY || "", {
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return paddleClient;
}
