"use client";

import { useState } from "react";
import { Check, Dumbbell, Flower2, NotebookPen, PersonStanding, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Discipline } from "@/components/concept/mock-data";
import type { Task, TaskType } from "./mock-data";
import RecipeCarousel from "./RecipeCarousel";
import WorkoutDetailModal from "./WorkoutDetailModal";

const DISCIPLINE_ICON: Record<Discipline["id"], LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

const TYPE_ICON: Record<TaskType, LucideIcon> = {
  workout: Dumbbell,
  checkin: NotebookPen,
};

function iconFor(task: Task): LucideIcon {
  if (task.type === "workout" && task.discipline) return DISCIPLINE_ICON[task.discipline];
  return TYPE_ICON[task.type];
}

function TaskCard({
  task,
  justCompleted,
  onToggle,
  onOpenDetail,
}: {
  task: Task;
  justCompleted: boolean;
  onToggle: (id: string) => void;
  onOpenDetail?: () => void;
}) {
  const isDone = task.status === "done";
  const Icon = iconFor(task);
  const clickable = task.type === "workout" && Boolean(onOpenDetail);

  return (
    <div
      className={cn(
        "rounded-3xl border p-6 transition-all duration-300 ease-in-out",
        isDone ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]",
        justCompleted && "animate-glow-pulse"
      )}
    >
      <div
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onOpenDetail : undefined}
        className={cn("flex items-start gap-4", clickable && "-m-1 cursor-pointer rounded-2xl p-1 transition-colors duration-200 hover:bg-stone-50")}
      >
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center transition-all duration-300 ease-in-out",
            isDone ? "rounded-full bg-emerald-100 text-emerald-600" : "rounded-2xl bg-stone-50 text-stone-700"
          )}
          aria-hidden
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 pt-1">
          {task.type === "workout" && task.discipline && (
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {task.discipline}
            </p>
          )}
          <h3 className="text-xl font-bold leading-snug text-stone-900">{task.title}</h3>
          <p className="mt-1.5 text-base leading-relaxed text-stone-500">{task.detail}</p>
          {clickable && <p className="mt-1.5 text-sm font-semibold text-[var(--accent)]">View workout</p>}
        </div>
      </div>

      {/* Massive, unmistakable tap target — spans the full card width. */}
      <button
        onClick={() => onToggle(task.id)}
        aria-pressed={isDone}
        className={cn(
          "mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl py-5 text-lg font-bold transition-all duration-300 ease-in-out active:scale-[0.97]",
          isDone ? "bg-emerald-500 text-white" : "bg-stone-900 text-white hover:bg-stone-800"
        )}
      >
        {isDone ? (
          <>
            <Check key={`${task.id}-check`} className="animate-pop-in h-6 w-6" strokeWidth={2.5} aria-hidden />
            Done!
          </>
        ) : (
          "Mark as Done"
        )}
      </button>
    </div>
  );
}

export default function DayStream({
  tasks,
  justCompletedId,
  onToggle,
  onLogMeal,
}: {
  tasks: Task[];
  justCompletedId: string | null;
  onToggle: (id: string) => void;
  onLogMeal: (recipeId: string) => void;
}) {
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = tasks.find((t) => t.id === detailTaskId) ?? null;

  return (
    <div className="space-y-5">
      {tasks.map((task, i) => (
        <div key={task.id} className="space-y-5">
          <TaskCard
            task={task}
            justCompleted={task.id === justCompletedId}
            onToggle={onToggle}
            onOpenDetail={task.type === "workout" ? () => setDetailTaskId(task.id) : undefined}
          />
          {/* Recipe suggestions sit inline in the stream right after the
              workout entry — browsable, not a checkable step, except for
              the "Mark as Eaten" quick-action on each card. */}
          {task.type === "workout" && i === 0 && <RecipeCarousel onLogMeal={onLogMeal} />}
        </div>
      ))}

      <WorkoutDetailModal
        open={detailTask !== null}
        title={detailTask?.title ?? ""}
        completed={detailTask?.status === "done"}
        onClose={() => setDetailTaskId(null)}
        onComplete={() => detailTask && onToggle(detailTask.id)}
      />
    </div>
  );
}
