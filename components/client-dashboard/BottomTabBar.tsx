"use client";

import { cn } from "@/lib/cn";

export type Tab = "today" | "progress" | "messages";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "☀️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "messages", label: "Messages", icon: "💬" },
];

export default function BottomTabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-transform duration-150 active:scale-95"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-base transition-colors duration-200",
                  isActive && "bg-[var(--accent-soft)]"
                )}
                aria-hidden
              >
                {tab.icon}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors duration-200",
                  isActive ? "text-[var(--accent)]" : "text-stone-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
