"use client";

import { Home, MessageCircle, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type Tab = "home" | "chat" | "profile";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat with Coach", icon: MessageCircle },
  { id: "profile", label: "My Profile", icon: User },
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
              className="flex flex-1 flex-col items-center gap-1 py-1.5 transition-all duration-300 ease-in-out active:scale-95"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-in-out",
                  isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-stone-400"
                )}
                aria-hidden
              >
                <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              </span>
              <span
                className={cn(
                  "text-center text-xs font-semibold leading-tight transition-colors duration-300",
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
