import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientDashboardDemo from "@/components/client-dashboard/ClientDashboardDemo";

// Design concept / blueprint only — not linked from real navigation and not
// wired to Supabase. The real client portal is app/c/[token]/page.tsx; this
// route exists purely to preview the habit-ring + timeline + reward-toast
// pattern proposed for a future richer client dashboard. See
// components/client-dashboard/mock-data.ts for the illustrative data shape.
//
// Gated behind coach auth (same check every /coach/* page uses) so it isn't
// publicly reachable — an anonymous visitor gets redirected to sign in.
export default async function ClientDashboardDesignPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/coach/login");

  return (
    <div>
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
        Design concept — mock data, not wired to a real account. See components/client-dashboard/.
      </div>
      <ClientDashboardDemo />
    </div>
  );
}
