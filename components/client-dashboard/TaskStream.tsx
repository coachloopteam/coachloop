"use client";

import { cn } from "@/lib/cn";
import type { Task, TaskType } from "./mock-data";

const TYPE_ICON: Record<TaskType, string> = {
  workout: "🏋️",
  meal: "🍽️",
  checkin: "📝",
};

export default function TaskStream({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isDone = task.status === "done";
        return (
          <div
            key={task.id}
            className={cn(
              "rounded-3xl border p-6 transition-colors duration-300",
              isDone ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]"
            )}
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-colors duration-300",
                  isDone ? "bg-emerald-100" : "bg-stone-50"
                )}
                aria-hidden
              >
                {TYPE_ICON[task.type]}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-xl font-bold leading-snug text-stone-900">{task.title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-stone-500">{task.detail}</p>
              </div>
            </div>

            {/* Massive, unmistakable tap target — spans the full card width. */}
            <button
              onClick={() => onToggle(task.id)}
              aria-pressed={isDone}
              className={cn(
                "mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl py-5 text-lg font-bold transition-all duration-300 ease-out active:scale-[0.97]",
                isDone ? "bg-emerald-500 text-white" : "bg-stone-900 text-white hover:bg-stone-800"
              )}
            >
              {isDone ? (
                <>
                  <svg key={`${task.id}-check`} className="animate-pop-in h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Done!
                </>
              ) : (
                "Mark as Done"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
