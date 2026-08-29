import ClientDashboardDemo from "@/components/client-dashboard/ClientDashboardDemo";

// Design concept / blueprint only — not linked from real navigation and not
// wired to Supabase. The real client portal is app/c/[token]/page.tsx; this
// route exists purely to preview the habit-ring + timeline + reward-toast
// pattern proposed for a future richer client dashboard. See
// components/client-dashboard/mock-data.ts for the illustrative data shape.
export default function ClientDashboardDesignPage() {
  return (
    <div>
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
        Design concept — mock data, not wired to a real account. See components/client-dashboard/.
      </div>
      <ClientDashboardDemo />
    </div>
  );
}
