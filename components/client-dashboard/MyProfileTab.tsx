// Deliberately no chart here — this audience is "completely non-technical,"
// and a bar chart is exactly the kind of thing that isn't. Plain numbers say
// more, faster, than a graph would.
export default function MyProfileTab({
  name,
  coachName,
  streak,
  totalCheckins,
  level,
  xp,
}: {
  name: string;
  coachName: string;
  streak: number;
  totalCheckins: number;
  level: number;
  xp: number;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col items-center rounded-3xl border border-stone-100 bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
          aria-hidden
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
        <p className="mt-4 text-xl font-bold text-stone-900">{name}</p>
        <p className="mt-1 text-base text-stone-500">Coached by {coachName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-stone-900">{streak}</p>
          <p className="mt-1 text-sm font-medium text-stone-500">Day Streak</p>
        </div>
        <div className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-stone-900">{totalCheckins}</p>
          <p className="mt-1 text-sm font-medium text-stone-500">Total Check-Ins</p>
        </div>
        <div className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-stone-900">{level}</p>
          <p className="mt-1 text-sm font-medium text-stone-500">Level</p>
        </div>
        <div className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-4xl font-bold text-stone-900">{xp}</p>
          <p className="mt-1 text-sm font-medium text-stone-500">Total XP</p>
        </div>
      </div>
    </div>
  );
}
