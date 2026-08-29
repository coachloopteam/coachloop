"use client";

import { useState } from "react";
import { createPortalSession } from "@/lib/paddle/portal";
import Button from "@/components/ui/Button";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createPortalSession();
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Opening…" : "Manage billing"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
