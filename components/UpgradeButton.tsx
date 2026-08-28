"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// TODO: once the new Product + price IDs exist in the existing Paddle catalog,
// set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID in env.
// This overlay-checkout approach needs no server round trip to open the modal;
// the webhook route (/api/webhooks/paddle) is what actually flips subscription_status.
export default function UpgradeButton({ customerEmail }: { customerEmail?: string }) {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return;
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    }).then(setPaddle);
  }, []);

  function openCheckout() {
    if (!paddle || !process.env.NEXT_PUBLIC_PADDLE_PRICE_ID) return;
    paddle.Checkout.open({
      items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID, quantity: 1 }],
      customer: customerEmail ? { email: customerEmail } : undefined,
    });
  }

  return (
    <button
      onClick={openCheckout}
      disabled={!paddle}
      className="bg-neutral-900 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
    >
      Upgrade
    </button>
  );
}
