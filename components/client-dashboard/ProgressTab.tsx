import { MOCK_WEEK_PROGRESS } from "./mock-data";

export default function ProgressTab({ streak, doneToday, totalToday }: { streak: number; doneToday: number; totalToday: number }) {
  const avg = Math.round(MOCK_WEEK_PROGRESS.reduce((sum, d) => sum + d.percent, 0) / MOCK_WEEK_PROGRESS.length);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-bold text-stone-900">
            {streak}
            <span className="text-sm font-medium text-stone-400"> days</span>
          </p>
          <p className="mt-0.5 text-xs font-medium text-stone-500">Current streak</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-bold text-stone-900">
            {avg}
            <span className="text-sm font-medium text-stone-400">%</span>
          </p>
          <p className="mt-0.5 text-xs font-medium text-stone-500">Weekly average</p>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">This week</h3>
          <span className="text-xs font-medium text-stone-400">
            {doneToday}/{totalToday} today
          </span>
        </div>
        {/* Two separate rows (bars, then labels) rather than nesting the
            label inside each bar column: with `items-end` on the row, flex
            children aren't stretched to the row's own height, so a bar's
            `height: X%` has no definite ancestor height to resolve against
            and collapses to 0. Keeping the bars row at the default `stretch`
            alignment gives each bar's wrapper a real 96px to size against. */}
        <div className="mt-5 flex gap-2" style={{ height: 96 }}>
          {MOCK_WEEK_PROGRESS.map((day) => (
            <div key={day.label} className="flex flex-1 items-end">
              <div
                className="w-full rounded-lg transition-all duration-500 ease-out"
                style={{
                  height: `${Math.max(day.percent, 6)}%`,
                  background:
                    day.percent === 100
                      ? "linear-gradient(180deg, var(--accent), #ff8a65)"
                      : "var(--accent-soft)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {MOCK_WEEK_PROGRESS.map((day) => (
            <span key={day.label} className="flex-1 text-center text-[11px] font-medium text-stone-400">
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
