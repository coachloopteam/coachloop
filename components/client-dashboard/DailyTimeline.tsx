"use client";

import { cn } from "@/lib/cn";
import type { TimelineItem, TimelineItemType } from "./mock-data";

const TYPE_ICON: Record<TimelineItemType, string> = {
  workout: "🏋️",
  meal: "🍽️",
  habit: "🧘",
  note: "📝",
};

export default function DailyTimeline({
  items,
  onToggle,
}: {
  items: TimelineItem[];
  onToggle: (id: string) => void;
}) {
  let lastPeriod: TimelineItem["period"] | null = null;

  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const isDone = item.status === "done";
        const showPeriod = item.period !== lastPeriod;
        lastPeriod = item.period;
        const isLast = i === items.length - 1;

        return (
          <div key={item.id}>
            {showPeriod && (
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400 first:mt-0">
                {item.period}
              </p>
            )}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-colors duration-300",
                    isDone ? "bg-emerald-500 text-white" : "bg-white text-stone-400 ring-1 ring-stone-200"
                  )}
                >
                  {isDone ? (
                    <svg key={`${item.id}-check`} className="animate-pop-in h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span aria-hidden>{TYPE_ICON[item.type]}</span>
                  )}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "mt-1 w-px flex-1 transition-colors duration-500",
                      isDone ? "bg-emerald-300" : "bg-stone-200"
                    )}
                  />
                )}
              </div>

              <div className={cn("flex-1 pb-5", isLast && "pb-0")}>
                <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-stone-400">{item.time}</p>
                      <p
                        className={cn(
                          "mt-0.5 text-sm font-semibold transition-colors",
                          isDone ? "text-stone-400 line-through decoration-stone-300" : "text-stone-900"
                        )}
                      >
                        {item.title}
                      </p>
                      <p className={cn("mt-1 text-sm leading-relaxed", isDone ? "text-stone-300" : "text-stone-500")}>
                        {item.detail}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggle(item.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95",
                        isDone
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      )}
                    >
                      {isDone ? "Done" : "Mark done"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
