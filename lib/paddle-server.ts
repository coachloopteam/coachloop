import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let paddleClient: Paddle | null = null;

/**
 * Server-side Paddle SDK client — used to verify webhook signatures (that
 * part doesn't need PADDLE_API_KEY, it's keyed off PADDLE_WEBHOOK_SECRET;
 * see app/api/webhooks/paddle/route.ts) and to mint customer portal
 * sessions (lib/paddle/portal.ts), which does. Built lazily so that
 * `next build` never fails just because PADDLE_API_KEY isn't set yet.
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
