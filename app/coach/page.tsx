import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InviteClientForm from "@/components/InviteClientForm";
import UpgradeButton from "@/components/UpgradeButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Stacked unconditionally, not just below a breakpoint: this column is
            capped at max-w-2xl regardless of screen width, so there's rarely
            room for a real business name next to three actions on one row —
            a viewport breakpoint alone wouldn't fix that. */}
        <div className="animate-fade-in-up flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Dashboard</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-stone-900">
              {coach?.business_name || coach?.name || "Your dashboard"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {coach && <UpgradeButton subscriptionStatus={coach.subscription_status} />}
            <Link href="/coach/account" className={buttonClasses("ghost")}>
              Account & billing
            </Link>
            <Link href="/coach/methodology" className={buttonClasses("ghost")}>
              Edit methodology
            </Link>
          </div>
        </div>

        {!coach?.training_philosophy && (
          <Card className="animate-fade-in-up flex items-start gap-3 border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-900">
            <span className="mt-0.5 text-base" aria-hidden>
              ⚠️
            </span>
            <p>
              You haven&apos;t set your methodology yet — the AI feedback clients get is only as good
              as this.{" "}
              <Link href="/coach/methodology" className="font-medium underline underline-offset-2">
                Set it up now
              </Link>
              .
            </p>
          </Card>
        )}

        <div className="animate-fade-in-up">
          <InviteClientForm />
        </div>

        <Card className="animate-fade-in-up overflow-hidden">
          <h2 className="border-b border-stone-100 px-5 py-4 text-sm font-semibold text-stone-900">
            Your clients
          </h2>

          {!clients?.length && (
            <p className="px-5 py-8 text-center text-sm text-stone-400">No clients invited yet.</p>
          )}

          <div className="divide-y divide-stone-100">
            {clients?.map((c) => {
              const logs = (c.logs as { logged_at: string }[]) || [];
              const lastLog = logs.sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];
              const stale =
                c.status === "active" && (!lastLog || now - new Date(lastLog.logged_at).getTime() > THREE_DAYS);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-stone-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                      aria-hidden
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{c.name}</p>
                      <p className="truncate text-sm text-stone-500">
                        {c.status === "invited"
                          ? "Invited — hasn't logged in yet"
                          : lastLog
                            ? `Last log ${new Date(lastLog.logged_at).toLocaleDateString()}`
                            : "No logs yet"}
                      </p>
                    </div>
                  </div>
                  {stale && (
                    <Badge variant="danger" className="shrink-0">
                      No activity in 3+ days
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
