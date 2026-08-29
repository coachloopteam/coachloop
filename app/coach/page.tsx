import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InviteClientForm from "@/components/InviteClientForm";
import Card from "@/components/ui/Card";

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

  // Everything below is real, existing data — not a fabricated "message" or
  // "plan" feature. Just plain-language framing of what already exists:
  // an invited client who hasn't started, or an active one gone quiet.
  type Alert = { key: string; icon: string; text: string };
  const alerts: Alert[] = [];

  if (!coach?.training_philosophy) {
    alerts.push({
      key: "methodology",
      icon: "📝",
      text: "You haven't set up your coaching style yet — clients won't get great feedback until you do.",
    });
  }

  const clientRows = (clients ?? []).map((c) => {
    const logs = (c.logs as { logged_at: string }[]) || [];
    const lastLog = logs.sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];
    const stale = c.status === "active" && (!lastLog || now - new Date(lastLog.logged_at).getTime() > THREE_DAYS);
    return { ...c, lastLog, stale };
  });

  for (const c of clientRows) {
    if (c.status === "invited") {
      alerts.push({ key: `${c.id}-invited`, icon: "👋", text: `${c.name} hasn't started yet` });
    } else if (c.stale) {
      alerts.push({ key: `${c.id}-stale`, icon: "😴", text: `${c.name} has gone quiet — say hi!` });
    }
  }

  const firstName = coach?.name?.split(" ")[0] || "there";
  const planMessage =
    coach?.subscription_status === "active"
      ? "You're all set — thanks for being a subscriber!"
      : coach?.subscription_status === "past_due"
        ? "There's a problem with your last payment"
        : coach?.subscription_status === "canceled"
          ? "Your plan isn't active — pick one to keep going"
          : "You're on your free trial";

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Hi {firstName}! 👋</h1>
          <p className="mt-1 text-base text-stone-500">
            {coach?.business_name
              ? `Here's what's happening at ${coach.business_name}.`
              : "Here's what's happening with your clients today."}
          </p>
        </div>

        <div className="animate-fade-in-up">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400">Needs your attention</h2>
          {alerts.length === 0 ? (
            <Card className="flex items-center gap-3 border-emerald-100 bg-emerald-50/60 p-5">
              <span className="text-2xl" aria-hidden>
                ✅
              </span>
              <p className="text-base font-medium text-emerald-800">You&apos;re all caught up — nothing needs you right now.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((a) =>
                a.key === "methodology" ? (
                  <Link
                    key={a.key}
                    href="/coach/methodology"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 transition-colors hover:bg-amber-100/70"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl" aria-hidden>
                        {a.icon}
                      </span>
                      <span className="text-base font-medium text-amber-900">{a.text}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-amber-700">Set it up →</span>
                  </Link>
                ) : (
                  <Card key={a.key} className="flex items-center gap-3 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-50 text-xl" aria-hidden>
                      {a.icon}
                    </span>
                    <p className="text-base font-medium text-stone-900">{a.text}</p>
                  </Card>
                )
              )}
            </div>
          )}
        </div>

        <div className="animate-fade-in-up space-y-3">
          <InviteClientForm />

          <Link
            href="/coach/methodology"
            className="flex items-center gap-4 rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-16px_rgba(0,0,0,0.18)] active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl" aria-hidden>
              📝
            </span>
            <span>
              <span className="block text-lg font-semibold text-stone-900">Edit Your Coaching Style</span>
              <span className="block text-sm text-stone-500">Tell us how you like to coach</span>
            </span>
          </Link>

          <Link
            href="/coach/account"
            className="flex items-center gap-4 rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-16px_rgba(0,0,0,0.18)] active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-2xl" aria-hidden>
              💳
            </span>
            <span>
              <span className="block text-lg font-semibold text-stone-900">Manage Your Plan</span>
              <span className="block text-sm text-stone-500">{planMessage}</span>
            </span>
          </Link>
        </div>

        <Card className="animate-fade-in-up overflow-hidden">
          <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold text-stone-900">Your Clients</h2>

          {!clientRows.length && (
            <p className="px-5 py-8 text-center text-base text-stone-400">You haven&apos;t invited anyone yet.</p>
          )}

          <div className="divide-y divide-stone-100">
            {clientRows.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                  aria-hidden
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-stone-900">{c.name}</p>
                  <p className="truncate text-sm text-stone-500">
                    {c.status === "invited"
                      ? "Hasn't started yet"
                      : c.stale
                        ? "Been quiet a few days"
                        : c.lastLog
                          ? `Last check-in ${new Date(c.lastLog.logged_at).toLocaleDateString()}`
                          : "No check-ins yet"}
                  </p>
                </div>
                {c.status === "active" && !c.stale && (
                  <span className="shrink-0 text-xl" aria-hidden title="Doing great">
                    ✅
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Not a coach-facing feature — kept out of the main flow on purpose
            for this audience, but still reachable for design review. */}
        {process.env.DESIGN_PREVIEW_TOKEN && (
          <div className="pt-2 text-center">
            <Link
              href={`/design/client-dashboard/${process.env.DESIGN_PREVIEW_TOKEN}`}
              className="text-xs text-stone-300 transition-colors hover:text-stone-400"
            >
              Preview: client dashboard concept
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
