export interface PricingTierInfo {
  id: "starter" | "pro" | "advanced";
  name: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: { month: string; year: string };
}

// Price IDs come from the Paddle sandbox catalog (Checkout settings > Products).
// Swap for the production catalog's IDs when NEXT_PUBLIC_PADDLE_ENV flips to "production".
export const pricingTiers: PricingTierInfo[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For coaches just getting going with online clients.",
    features: [
      "AI-assisted feedback on every client log",
      "Custom training & nutrition methodology",
      "Client portal — no app download required",
    ],
    featured: false,
    priceId: {
      month: "pri_01m16mrafy4gqbwxzkk8zf724j",
      year: "pri_01m16sf8h6yyh7jc0dg2ac57bw",
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing coaching businesses managing more clients day to day.",
    features: [
      "Everything in Starter",
      "Stale-client activity alerts",
      "Priority AI feedback turnaround",
    ],
    featured: true,
    priceId: {
      month: "pri_01m16h6beatjt5st5bz5yqnxq7",
      year: "pri_01m16sks1bm4jpwc93dkvcksme",
    },
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "For established coaching businesses that need more headroom.",
    features: ["Everything in Pro", "Dedicated support"],
    featured: false,
    priceId: {
      month: "pri_01m16s9rszbsebfsme7ayqbzkd",
      year: "pri_01m16sn5b7wtdsehwe7jr7pkv9",
    },
  },
];

export function findTierByPriceId(priceId: string): PricingTierInfo | undefined {
  return pricingTiers.find((tier) => tier.priceId.month === priceId || tier.priceId.year === priceId);
}
