import { type Paddle, type PricePreviewParams, type PricePreviewResponse } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { pricingTiers } from "@/lib/pricing-tiers";

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams["items"] {
  return pricingTiers.flatMap((tier) =>
    [tier.priceId.month, tier.priceId.year].map((priceId) => ({
      priceId,
      quantity: 1,
    }))
  );
}

function getPriceAmounts(prices: PricePreviewResponse): PaddlePrices {
  return prices.data.details.lineItems.reduce<PaddlePrices>((acc, item) => {
    acc[item.price.id] = item.formattedTotals.total;
    return acc;
  }, {});
}

// 'OTHERS' is a sentinel meaning "let Paddle infer the country from IP" —
// it is never sent to Paddle itself, only used to decide whether to include
// `address` in the request.
export function usePaddlePrices(paddle: Paddle | undefined, country: string): { prices: PaddlePrices; loading: boolean } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paddle) return;

    const params: Partial<PricePreviewParams> = {
      items: getLineItems(),
      ...(country !== "OTHERS" && { address: { countryCode: country } }),
    };

    setLoading(true);
    paddle.PricePreview(params as PricePreviewParams).then((response) => {
      setPrices((prev) => ({ ...prev, ...getPriceAmounts(response) }));
      setLoading(false);
    });
  }, [country, paddle]);

  return { prices, loading };
}
