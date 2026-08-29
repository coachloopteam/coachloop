import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, CreditCard, NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InviteClientForm from "@/components/InviteClientForm";
import CheckInButton from "@/components/CheckInButton";
import Card from "@/components/ui/Card";

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

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
    .select("id, name, email, invite_token, status, created_at, logs(type, logged_at)")
    .eq("coach_id", coach?.id)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const staleAfterMs = (coach?.stale_after_days ?? 3) * 1000 * 60 * 60 * 24;
  const todayKey = new Date().toDateString();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const clientRows = (clients ?? []).map((c) => {
    const logs = (c.logs as { type: string; logged_at: string }[]) || [];
    const lastLog = logs.sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];
    const stale = c.status === "active" && (!lastLog || now - new Date(lastLog.logged_at).getTime() > staleAfterMs);
    return { ...c, lastLog, stale };
  });

  // Global metrics — plain-English, and all real. "Monthly Earnings via
  // Paddle" from the brief doesn't map to anything this app actually does:
  // Paddle here only charges the COACH for their own subscription — there's
  // no feature for a coach to collect payment from their clients through
  // this app, so there's no "earnings" figure to show honestly. Swapped in
  // "New Clients This Month" instead, which is real.
  const totalClients = clientRows.length;
  const activeToday = clientRows.filter(
    (c) => c.lastLog && new Date(c.lastLog.logged_at).toDateString() === todayKey
  ).length;
  const newThisMonth = clientRows.filter((c) => new Date(c.created_at) >= startOfMonth).length;

  const needsAttention = clientRows.filter((c) => c.status === "invited" || c.stale);

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
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Hi {firstName}</h1>
          <p className="mt-1 text-base text-stone-500">
            {coach?.business_name
              ? `Here's what's happening at ${coach.business_name}.`
              : "Here's what's happening with your clients today."}
          </p>
        </div>

        <div className="animate-fade-in-up grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-18px_rgba(0,0,0,0.14)]">
            <p className="text-3xl font-semibold tracking-tight text-stone-900">{totalClients}</p>
            <p className="mt-1 text-xs font-medium leading-tight text-stone-500">Total Clients Onboard</p>
          </div>
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-18px_rgba(0,0,0,0.14)]">
            <p className="text-3xl font-semibold tracking-tight text-stone-900">{activeToday}</p>
            <p className="mt-1 text-xs font-medium leading-tight text-stone-500">Clients Active Today</p>
          </div>
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-18px_rgba(0,0,0,0.14)]">
            <p className="text-3xl font-semibold tracking-tight text-stone-900">{newThisMonth}</p>
            <p className="mt-1 text-xs font-medium leading-tight text-stone-500">New Clients This Month</p>
          </div>
        </div>

        {!coach?.training_philosophy && (
          <Link
            href="/coach/methodology"
            className="animate-fade-in-up flex items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 transition-colors hover:bg-amber-100/70"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-amber-600" aria-hidden>
                <NotebookPen className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-base font-medium text-amber-900">
                You haven&apos;t set up your coaching style yet — clients won&apos;t get great feedback until you do.
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-amber-700">Set it up →</span>
          </Link>
        )}

        <div className="animate-fade-in-up">
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-stone-900">Who Needs Your Attention Today?</h2>
          {needsAttention.length === 0 ? (
            <Card className="flex items-center gap-3 border-emerald-100 bg-emerald-50/60 p-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" strokeWidth={1.75} aria-hidden />
              <p className="text-base font-medium text-emerald-800">Nobody&apos;s gone quiet — you&apos;re not missing anyone.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {needsAttention.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 rounded-3xl border border-amber-200/70 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="flex items-start gap-2 text-base font-medium text-amber-900">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden />
                    <span>
                      {c.status === "invited" ? (
                        <>
                          <span className="font-semibold">{c.name}</span> hasn&apos;t started yet
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{c.name}</span> hasn&apos;t checked in for{" "}
                          {c.lastLog
                            ? `${Math.floor((now - new Date(c.lastLog.logged_at).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : "a while"}
                        </>
                      )}
                    </span>
                  </p>
                  <CheckInButton clientName={c.name} email={c.email} inviteToken={c.invite_token} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="animate-fade-in-up space-y-3">
          <InviteClientForm />

          <Link
            href="/coach/methodology"
            className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-16px_rgba(0,0,0,0.18)] active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-700" aria-hidden>
              <NotebookPen className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-lg font-semibold text-stone-900">Edit Your Coaching Style</span>
              <span className="block text-sm text-stone-500">Tell us how you like to coach</span>
            </span>
          </Link>

          <Link
            href="/coach/account"
            className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_36px_-16px_rgba(0,0,0,0.18)] active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-700" aria-hidden>
              <CreditCard className="h-6 w-6" strokeWidth={1.5} />
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
            {clientRows.map((c) => {
              const hoursSinceLog = c.lastLog ? (now - new Date(c.lastLog.logged_at).getTime()) / (1000 * 60 * 60) : null;
              const status =
                c.status === "invited"
                  ? "Hasn't started yet"
                  : c.stale
                    ? "Stale activity"
                    : hoursSinceLog !== null && hoursSinceLog < 24
                      ? `Logged ${c.lastLog!.type} ${timeAgo(c.lastLog!.logged_at)}`
                      : c.lastLog
                        ? "Everything good"
                        : "No check-ins yet";
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-stone-50/70">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
                    aria-hidden
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-stone-900">{c.name}</p>
                    <p className="truncate text-sm text-stone-500">{status}</p>
                  </div>
                  {status === "Everything good" && (
                    <span title="Doing great">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={1.75} aria-hidden />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Not coach-facing features — kept out of the main flow for this
            audience, but still reachable for design review. */}
        {process.env.DESIGN_PREVIEW_TOKEN && (
          <div className="flex flex-col items-center gap-1 pt-2 text-center">
            <Link
              href={`/design/client-dashboard/${process.env.DESIGN_PREVIEW_TOKEN}`}
              className="text-xs text-stone-300 transition-colors hover:text-stone-400"
            >
              Preview: client dashboard concept
            </Link>
            <Link
              href={`/design/activity-hub/${process.env.DESIGN_PREVIEW_TOKEN}`}
              className="text-xs text-stone-300 transition-colors hover:text-stone-400"
            >
              Preview: workout hub & recipe vault concept
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
