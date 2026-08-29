"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import MobileHeader from "./MobileHeader";
import BottomTabBar, { type Tab } from "./BottomTabBar";
import TaskStream from "./TaskStream";
import MyProfileTab from "./MyProfileTab";
import ChatTab from "./ChatTab";
import ConfettiBurst from "./ConfettiBurst";
import { MOCK_TASKS, MOCK_STREAK_DAYS, MOCK_TOTAL_CHECKINS, type Task, type TaskStatus } from "./mock-data";

const CLIENT_NAME = "Jamie";
const COACH_NAME = "Alex Rivera";

function toggled(status: TaskStatus): TaskStatus {
  return status === "done" ? "pending" : "done";
}

export default function ClientDashboardDemo() {
  const [tab, setTab] = useState<Tab>("home");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [streak, setStreak] = useState(MOCK_STREAK_DAYS);
  const [celebrated, setCelebrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);

  function celebrate(message: string) {
    setToast(message);
    setBurstKey((k) => k + 1);
    window.setTimeout(() => setToast(null), 3200);
  }

  function toggleTask(id: string) {
    // Computed here (not inside the setTasks updater) so the celebration
    // side effect can't double-fire under StrictMode's double-invocation of
    // updater functions.
    const next = tasks.map((t) => (t.id === id ? { ...t, status: toggled(t.status) } : t));
    setTasks(next);

    const allDone = next.every((t) => t.status === "done");
    if (allDone && !celebrated) {
      setCelebrated(true);
      setStreak((s) => s + 1);
      celebrate("🎉 All done for today — streak extended!");
    } else if (!allDone && celebrated) {
      setCelebrated(false);
    }
  }

  const tasksLeft = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background sm:border-x sm:border-stone-100">
      <MobileHeader name={CLIENT_NAME} tasksLeft={tasksLeft} />

      <main className="relative flex-1 px-4 pb-28 pt-5">
        {tab === "home" && (
          <div className="animate-fade-in space-y-5">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Your Tasks For Today</h1>
            {burstKey > 0 && <ConfettiBurst key={burstKey} />}
            <TaskStream tasks={tasks} onToggle={toggleTask} />
          </div>
        )}

        {tab === "chat" && <ChatTab coachName={COACH_NAME} />}

        {tab === "profile" && (
          <MyProfileTab name={CLIENT_NAME} coachName={COACH_NAME} streak={streak} totalCheckins={MOCK_TOTAL_CHECKINS} />
        )}
      </main>

      <BottomTabBar active={tab} onChange={setTab} />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 transition-opacity duration-300",
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
