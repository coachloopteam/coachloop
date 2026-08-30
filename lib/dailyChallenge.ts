// Deterministically picks one workout id as "today's challenge" from a
// caller-supplied, stably-ordered list of eligible ids. Same list + same
// UTC calendar day always picks the same id — used by both
// app/c/[token]/page.tsx (to feature it) and app/api/daily-log/route.ts (to
// decide the bonus XP), so the two never disagree about which workout is
// "the challenge" today. No new table: this repurposes the existing
// workouts/daily_logs tables rather than adding challenge-specific schema.
export function pickDailyChallengeId(ids: string[], date: Date = new Date()): string | null {
  if (ids.length === 0) return null;
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86400000
  );
  return ids[dayOfYear % ids.length];
}
