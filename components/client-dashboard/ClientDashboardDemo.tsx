"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import MobileHeader from "./MobileHeader";
import BottomTabBar, { type Tab } from "./BottomTabBar";
import HabitRing from "./HabitRing";
import BentoTaskGrid from "./BentoTaskGrid";
import ProgressTab from "./ProgressTab";
import MessagesTab from "./MessagesTab";
import ConfettiBurst from "./ConfettiBurst";
import {
  MOCK_HABITS,
  MOCK_TIMELINE,
  MOCK_STREAK_DAYS,
  type Habit,
  type HabitStatus,
  type TimelineItem,
} from "./mock-data";

const CLIENT_NAME = "Jamie";
const COACH_NAME = "Alex Rivera";

function toggled(status: HabitStatus): HabitStatus {
  return status === "done" ? "pending" : "done";
}

export default function ClientDashboardDemo() {
  const [tab, setTab] = useState<Tab>("today");
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(MOCK_TIMELINE);
  const [streak, setStreak] = useState(MOCK_STREAK_DAYS);
  const [celebrated, setCelebrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);

  function celebrate(message: string) {
    setToast(message);
    setBurstKey((k) => k + 1);
    window.setTimeout(() => setToast(null), 3200);
  }

  function toggleHabit(id: string) {
    // Computed here (not inside the setHabits updater) so the celebration
    // side effect can't double-fire under StrictMode's double-invocation of
    // updater functions.
    const next = habits.map((h) => (h.id === id ? { ...h, status: toggled(h.status) } : h));
    setHabits(next);

    const allDone = next.every((h) => h.status === "done");
    if (allDone && !celebrated) {
      setCelebrated(true);
      setStreak((s) => s + 1);
      celebrate("🔥 Full day complete — streak extended!");
    } else if (!allDone && celebrated) {
      setCelebrated(false);
    }
  }

  function toggleTimelineItem(id: string) {
    setTimeline((prev) => prev.map((t) => (t.id === id ? { ...t, status: toggled(t.status) } : t)));
  }

  const doneToday = timeline.filter((t) => t.status === "done").length;
  const tasksLeft = timeline.length - doneToday;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background sm:border-x sm:border-stone-100">
      <MobileHeader name={CLIENT_NAME} tasksLeft={tasksLeft} />

      <main className="flex-1 space-y-5 px-4 pb-28 pt-5">
        {tab === "today" && (
          <div className="animate-fade-in space-y-5">
            <div className="flex justify-end">
              <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <span aria-hidden>🔥</span>
                {streak}-day streak
              </div>
            </div>

            <div className="relative rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]">
              {burstKey > 0 && <ConfettiBurst key={burstKey} />}
              <HabitRing habits={habits} onToggle={toggleHabit} />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900">Today&apos;s plan</h2>
                <span className="text-xs font-medium text-stone-400">
                  {doneToday}/{timeline.length} complete
                </span>
              </div>
              <BentoTaskGrid items={timeline} onToggle={toggleTimelineItem} />
            </div>
          </div>
        )}

        {tab === "progress" && <ProgressTab streak={streak} doneToday={doneToday} totalToday={timeline.length} />}

        {tab === "messages" && <MessagesTab coachName={COACH_NAME} />}
      </main>

      <BottomTabBar active={tab} onChange={setTab} />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4 transition-opacity duration-300",
          toast ? "opacity-100" : "opacity-0"
        )}
      >
        {toast && (
          <div className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
