"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// This component only opens the checkout overlay — the webhook route
// (/api/webhooks/paddle) is what actually flips subscription_status once
// Paddle confirms payment. `customData.coach_id` is what lets that webhook
// find the right coach row on the very first checkout, before a
// paddle_customer_id has ever been stored for this coach.
export default function UpgradeButton({
  coachId,
  customerEmail,
  subscriptionStatus,
}: {
  coachId: string;
  customerEmail?: string;
  subscriptionStatus?: string | null;
}) {
  const [paddle, setPaddle] = useState<Paddle>();

  const configured = Boolean(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  );

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return;
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    }).then(setPaddle);
  }, []);

  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return (
      <span className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
        {subscriptionStatus === "trialing" ? "Trial active" : "Subscribed"}
      </span>
    );
  }

  function openCheckout() {
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
    if (!paddle || !priceId) return;
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: customerEmail ? { email: customerEmail } : undefined,
      customData: { coach_id: coachId },
    });
  }

  return (
    <button
      onClick={openCheckout}
      disabled={!paddle || !configured}
      title={configured ? undefined : "Paddle isn't configured yet — see .env.local.example"}
      className="bg-neutral-900 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
    >
      Upgrade
    </button>
  );
}
