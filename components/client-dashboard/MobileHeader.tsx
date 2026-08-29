"use client";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function MobileHeader({ name, tasksLeft }: { name: string; tasksLeft: number }) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-stone-900">
            {timeOfDayGreeting()}, {name}
          </p>
          <p className="text-xs text-stone-500">
            {tasksLeft === 0 ? "All caught up for today 🎉" : `${tasksLeft} task${tasksLeft === 1 ? "" : "s"} left today`}
          </p>
        </div>
      </div>
    </header>
  );
}
