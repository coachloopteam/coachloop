"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import MobileHeader from "./MobileHeader";
import BottomTabBar, { type Tab } from "./BottomTabBar";
import DayStream from "./DayStream";
import ForYouCarousel from "./ForYouCarousel";
import SmartMatchSearch from "./SmartMatchSearch";
import CoachFinder from "./CoachFinder";
import DailyChallenge from "./DailyChallenge";
import MyProfileTab from "./MyProfileTab";
import ChatTab from "./ChatTab";
import ConfettiBurst from "./ConfettiBurst";
import {
  MOCK_TASKS,
  MOCK_STREAK_DAYS,
  MOCK_TOTAL_CHECKINS,
  MOCK_XP,
  XP_PER_LEVEL,
  TASK_XP_REWARD,
  WORKOUT_START_XP_REWARD,
  type Task,
  type TaskStatus,
} from "./mock-data";

const CLIENT_NAME = "Jamie";
const COACH_NAME = "Alex Rivera";

function toggled(status: TaskStatus): TaskStatus {
  return status === "done" ? "pending" : "done";
}

export default function ClientDashboardDemo({ token }: { token?: string }) {
  const [tab, setTab] = useState<Tab>("home");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [streak, setStreak] = useState(MOCK_STREAK_DAYS);
  const [xp, setXp] = useState(MOCK_XP);
  const [celebrated, setCelebrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;

  function celebrate(message: string) {
    setToast(message);
    setBurstKey((k) => k + 1);
    window.setTimeout(() => setToast(null), 3200);
  }

  function earnXp(amount: number) {
    setXp((x) => x + amount);
  }

  function toggleTask(id: string) {
    // Computed here (not inside the setTasks updater) so the celebration
    // side effect can't double-fire under StrictMode's double-invocation of
    // updater functions.
    const target = tasks.find((t) => t.id === id);
    const next = tasks.map((t) => (t.id === id ? { ...t, status: toggled(t.status) } : t));
    setTasks(next);

    if (target?.status !== "done") {
      setJustCompletedId(id);
      earnXp(TASK_XP_REWARD);
      window.setTimeout(() => setJustCompletedId((cur) => (cur === id ? null : cur)), 900);
    }

    const allDone = next.every((t) => t.status === "done");
    if (allDone && !celebrated) {
      setCelebrated(true);
      setStreak((s) => s + 1);
      celebrate("All done for today — streak extended!");
    } else if (!allDone && celebrated) {
      setCelebrated(false);
    }
  }

  function handleStartWorkout() {
    earnXp(WORKOUT_START_XP_REWARD);
    celebrate(`+${WORKOUT_START_XP_REWARD} XP — session started!`);
  }

  function handleCompleteChallenge(reward: number) {
    earnXp(reward);
    celebrate(`+${reward} XP — challenge completed!`);
  }

  const tasksLeft = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background sm:border-x sm:border-stone-100">
      <MobileHeader name={CLIENT_NAME} tasksLeft={tasksLeft} streak={streak} xp={xp} xpGoal={XP_PER_LEVEL} level={level} />

      <main className="relative flex-1 px-4 pb-28 pt-5">
        {tab === "home" && (
          <div className="animate-fade-in space-y-7">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Your Day, At a Glance</h1>
            {burstKey > 0 && <ConfettiBurst key={burstKey} />}

            <DailyChallenge onComplete={handleCompleteChallenge} />
            <ForYouCarousel onStartWorkout={handleStartWorkout} />
            <SmartMatchSearch />
            <CoachFinder />
            {token && (
              <Link
                href={`/design/media-hub/${token}`}
                className="flex items-center gap-4 rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-18px_rgba(0,0,0,0.16)] active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-700" aria-hidden>
                  <Film className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-stone-900">Instructional Media Hub</span>
                  <span className="block text-sm text-stone-500">Form breakdowns for Fitness, Yoga &amp; Pilates</span>
                </span>
              </Link>
            )}
            <DayStream tasks={tasks} justCompletedId={justCompletedId} onToggle={toggleTask} />
          </div>
        )}

        {tab === "chat" && <ChatTab coachName={COACH_NAME} />}

        {tab === "profile" && (
          <MyProfileTab
            name={CLIENT_NAME}
            coachName={COACH_NAME}
            streak={streak}
            totalCheckins={MOCK_TOTAL_CHECKINS}
            level={level}
            xp={xp}
          />
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
          <div className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-stone-900/90 px-5 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
