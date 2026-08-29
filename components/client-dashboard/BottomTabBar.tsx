"use client";

import { cn } from "@/lib/cn";

export type Tab = "home" | "chat" | "profile";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "chat", label: "Chat with Coach", icon: "💬" },
  { id: "profile", label: "My Profile", icon: "👤" },
];

export default function BottomTabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-stone-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pt-2">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-1.5 transition-transform duration-150 active:scale-95"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-200",
                  isActive && "bg-[var(--accent-soft)]"
                )}
                aria-hidden
              >
                {tab.icon}
              </span>
              <span
                className={cn(
                  "text-center text-xs font-semibold leading-tight transition-colors duration-200",
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
