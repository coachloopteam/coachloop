import Link from "next/link";

// Just the status badge / entry point into /coach/pricing — the webhook route
// (/api/webhooks/paddle) is what actually flips subscription_status once
// Paddle confirms payment. Checkout itself (and `customData.coach_id`, which
// lets that webhook find the right coach row on the very first checkout)
// lives in components/PricingCards.tsx.
export default function UpgradeButton({ subscriptionStatus }: { subscriptionStatus?: string | null }) {
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return (
      <span className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
        {subscriptionStatus === "trialing" ? "Trial active" : "Subscribed"}
      </span>
    );
  }

  return (
    <Link
      href="/coach/pricing"
      className="bg-neutral-900 text-white rounded-lg px-4 py-2 font-medium inline-block"
    >
      Upgrade
    </Link>
  );
}
