"use client";

import { cn } from "@/lib/cn";
import type { TimelineItem, TimelineItemType } from "./mock-data";

const TYPE_ICON: Record<TimelineItemType, string> = {
  workout: "🏋️",
  meal: "🍽️",
  habit: "🧘",
  note: "📝",
};

export default function BentoTaskGrid({
  items,
  onToggle,
}: {
  items: TimelineItem[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const isDone = item.status === "done";
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            aria-pressed={isDone}
            className={cn(
              "relative flex min-h-[136px] flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-300 ease-out active:scale-[0.97]",
              isDone ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors duration-300",
                isDone ? "bg-emerald-100" : "bg-stone-50"
              )}
              aria-hidden
            >
              {isDone ? "✅" : TYPE_ICON[item.type]}
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-stone-400">{item.time}</p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold leading-snug transition-colors duration-300",
                  isDone ? "text-stone-400 line-through decoration-stone-300" : "text-stone-900"
                )}
              >
                {item.title}
              </p>
            </div>

            {isDone && (
              <span
                key={`${item.id}-check`}
                className="animate-pop-in absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
                aria-hidden
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
