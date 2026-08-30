import { Award, TrendingUp } from "lucide-react";

// Retention rate and check-ins are both computed from real client/log data
// passed in by app/coach/page.tsx — nothing here is mock. The badge-level
// thresholds below are a presentational device only (not stored anywhere,
// not a claim about the coach's actual standing) — same spirit as the
// illustrative XP/level mapping on the client-dashboard concept.
const LEVELS = [
  { min: 90, label: "Level 4 — Architect" },
  { min: 75, label: "Level 3 — Strategist" },
  { min: 50, label: "Level 2 — Builder" },
  { min: 0, label: "Level 1 — Starter" },
];

function levelFor(rate: number) {
  return LEVELS.find((l) => rate >= l.min) ?? LEVELS[LEVELS.length - 1];
}

export default function CoachGrowthCard({
  retentionRate,
  checkInsToday,
  activatedCount,
}: {
  retentionRate: number | null;
  checkInsToday: number;
  activatedCount: number;
}) {
  const level = retentionRate !== null ? levelFor(retentionRate) : null;
  const nextThreshold = level ? LEVELS[LEVELS.indexOf(level) - 1]?.min ?? 100 : 100;

  return (
    <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-stone-900">Growth &amp; Retention</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <Award className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          {level ? level.label : "Getting Started"}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-stone-100">
        <div className="px-5 py-5 text-center">
          <p className="text-3xl font-semibold tracking-tight text-stone-900">
            {retentionRate !== null ? `${retentionRate}%` : "—"}
          </p>
          <p className="mt-1 text-xs font-medium leading-tight text-stone-500">
            Client Retention Rate{activatedCount > 0 ? ` (of ${activatedCount})` : ""}
          </p>
        </div>
        <div className="px-5 py-5 text-center">
          <p className="text-3xl font-semibold tracking-tight text-stone-900">{checkInsToday}</p>
          <p className="mt-1 text-xs font-medium leading-tight text-stone-500">Active Check-ins Today</p>
        </div>
      </div>

      {retentionRate !== null && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              Next milestone
            </span>
            <span>{Math.min(retentionRate, nextThreshold)}% / {nextThreshold}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.round((retentionRate / nextThreshold) * 100))}%`,
                background: "linear-gradient(90deg, var(--accent), #ff8a65)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
