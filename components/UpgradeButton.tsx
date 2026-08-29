import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";

// Just the status badge / entry point into /coach/pricing — the webhook route
// (/api/webhooks/paddle) is what actually flips subscription_status once
// Paddle confirms payment. Checkout itself (and `customData.coach_id`, which
// lets that webhook find the right coach row on the very first checkout)
// lives in components/PricingCards.tsx.
export default function UpgradeButton({ subscriptionStatus }: { subscriptionStatus?: string | null }) {
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return (
      <Badge variant="success">
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
        {subscriptionStatus === "trialing" ? "Trial active" : "Subscribed"}
      </Badge>
    );
  }

  return (
    <Link href="/coach/pricing" className={buttonClasses("accent")}>
      Upgrade
    </Link>
  );
}
