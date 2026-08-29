"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { pricingTiers } from "@/lib/pricing-tiers";
import { usePaddlePrices } from "@/lib/usePaddlePrices";

type Frequency = "month" | "year";

export default function PricingCards({
  coachId,
  customerEmail,
  country,
}: {
  coachId: string;
  customerEmail?: string;
  country: string;
}) {
  const [frequency, setFrequency] = useState<Frequency>("month");
  const [paddle, setPaddle] = useState<Paddle>();

  const configured = Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
  const { prices, loading } = usePaddlePrices(paddle, country);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return;
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    }).then(setPaddle);
  }, []);

  function subscribe(priceId: string) {
    if (!paddle) return;
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: customerEmail ? { email: customerEmail } : undefined,
      customData: { coach_id: coachId },
    });
  }

  return (
    <div className="space-y-8" data-testid="pricing-cards">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setFrequency("month")}
          data-testid="frequency-month"
          className={`text-sm px-3 py-1.5 rounded-full font-medium ${
            frequency === "month" ? "bg-neutral-900 text-white" : "text-neutral-600"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setFrequency("year")}
          data-testid="frequency-year"
          className={`text-sm px-3 py-1.5 rounded-full font-medium ${
            frequency === "year" ? "bg-neutral-900 text-white" : "text-neutral-600"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {pricingTiers.map((tier) => {
          const priceId = tier.priceId[frequency];
          const formatted = prices[priceId];
          return (
            <div
              key={tier.id}
              data-testid={`tier-${tier.id}`}
              className={`rounded-2xl border p-6 flex flex-col ${
                tier.featured ? "border-neutral-900 shadow-sm" : "border-neutral-200"
              }`}
            >
              {tier.featured && (
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{tier.description}</p>

              <p className="mt-6 text-3xl font-semibold" data-testid={`price-${tier.id}`}>
                {!configured ? "—" : loading || !formatted ? "…" : formatted}
                <span className="text-sm font-normal text-neutral-500">/{frequency}</span>
              </p>

              <ul className="mt-6 space-y-2 text-sm text-neutral-700 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(priceId)}
                disabled={!paddle || !configured}
                data-testid={`subscribe-${tier.id}`}
                title={configured ? undefined : "Paddle isn't configured yet — see .env.local.example"}
                className={`mt-6 rounded-lg px-4 py-2 font-medium disabled:opacity-50 ${
                  tier.featured ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"
                }`}
              >
                Subscribe
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
