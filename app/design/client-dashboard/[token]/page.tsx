import { notFound } from "next/navigation";
import ClientDashboardDemo from "@/components/client-dashboard/ClientDashboardDemo";

// Design concept / blueprint only — not linked from real navigation and not
// wired to Supabase. The real client portal is app/c/[token]/page.tsx; this
// route exists purely to preview the habit-ring + timeline + reward-toast
// pattern proposed for a future richer client dashboard. See
// components/client-dashboard/mock-data.ts for the illustrative data shape.
//
// Gated the same way the real client portal is: an unguessable token in the
// URL, no login required — NOT coach Supabase Auth. Real clients never have
// a coach account (they only ever use a token link), so gating a
// client-facing preview behind coach login would make it unreachable by the
// audience it's actually for. This is a single shared secret rather than a
// per-client DB-validated token since the page shows fixed mock data
// regardless of who's viewing it.
export default async function ClientDashboardDesignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const expected = process.env.DESIGN_PREVIEW_TOKEN;
  if (!expected || token !== expected) notFound();

  return (
    <div>
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
        Design concept — mock data, not wired to a real account. See components/client-dashboard/.
      </div>
      <ClientDashboardDemo token={token} />
    </div>
  );
}
