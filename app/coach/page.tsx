import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InviteClientForm from "@/components/InviteClientForm";
import UpgradeButton from "@/components/UpgradeButton";

export default async function CoachDashboard() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect("/coach/login");
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("auth_user_id", auth.user.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, status, created_at, logs(logged_at)")
    .eq("coach_id", coach?.id)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{coach?.business_name || coach?.name || "Your dashboard"}</h1>
          <div className="flex items-center gap-4">
            {coach && <UpgradeButton subscriptionStatus={coach.subscription_status} />}
            <Link href="/coach/methodology" className="text-sm underline text-neutral-600">
              Edit methodology
            </Link>
          </div>
        </div>

        {!coach?.training_philosophy && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
            You haven&apos;t set your methodology yet — the AI feedback clients get is only as good
            as this.{" "}
            <Link href="/coach/methodology" className="underline font-medium">
              Set it up now
            </Link>
            .
          </div>
        )}

        <InviteClientForm />

        <div className="bg-white border border-neutral-200 rounded-xl divide-y">
          <h2 className="font-medium p-5 pb-3">Your clients</h2>
          {!clients?.length && <p className="px-5 pb-5 text-sm text-neutral-500">No clients invited yet.</p>}
          {clients?.map((c) => {
            const logs = (c.logs as { logged_at: string }[]) || [];
            const lastLog = logs.sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];
            const stale = c.status === "active" && (!lastLog || now - new Date(lastLog.logged_at).getTime() > THREE_DAYS);
            return (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-neutral-500">
                    {c.status === "invited" ? "Invited — hasn't logged in yet" : lastLog ? `Last log ${new Date(lastLog.logged_at).toLocaleDateString()}` : "No logs yet"}
                  </p>
                </div>
                {stale && (
                  <span className="text-xs bg-red-100 text-red-700 rounded-full px-3 py-1 font-medium">
                    No activity in 3+ days
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
