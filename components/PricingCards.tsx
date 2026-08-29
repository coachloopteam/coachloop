"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { pricingTiers } from "@/lib/pricing-tiers";
import { usePaddlePrices } from "@/lib/usePaddlePrices";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

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
    <div className="animate-fade-in-up space-y-10" data-testid="pricing-cards">
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center rounded-full border border-stone-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setFrequency("month")}
            data-testid="frequency-month"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              frequency === "month" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setFrequency("year")}
            data-testid="frequency-year"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              frequency === "year" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {pricingTiers.map((tier) => {
          const priceId = tier.priceId[frequency];
          const formatted = prices[priceId];
          return (
            <Card
              key={tier.id}
              data-testid={`tier-${tier.id}`}
              interactive
              className={cn("relative flex flex-col p-6", tier.featured && "border-transparent")}
              style={
                tier.featured
                  ? {
                      backgroundImage:
                        "linear-gradient(white, white), linear-gradient(135deg, var(--accent), #ff8a65)",
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box",
                      border: "1px solid transparent",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 36px -16px rgba(255,90,95,0.3)",
                    }
                  : undefined
              }
            >
              {tier.featured && (
                <span
                  className="absolute -top-3 left-6 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                >
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-stone-900">{tier.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500">{tier.description}</p>

              <p className="mt-6 text-3xl font-semibold tracking-tight text-stone-900" data-testid={`price-${tier.id}`}>
                {!configured ? (
                  "—"
                ) : loading || !formatted ? (
                  <span className="text-stone-300">…</span>
                ) : (
                  formatted
                )}
                <span className="text-sm font-normal text-stone-400">/{frequency}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-stone-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(priceId)}
                disabled={!paddle || !configured}
                data-testid={`subscribe-${tier.id}`}
                title={configured ? undefined : "Paddle isn't configured yet — see .env.local.example"}
                className={cn("mt-6", buttonClasses(tier.featured ? "accent" : "secondary"))}
              >
                Subscribe
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
