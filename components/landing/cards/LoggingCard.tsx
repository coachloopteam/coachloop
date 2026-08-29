import { Check, Dumbbell, Flower2, PersonStanding, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import BentoCard from "../BentoCard";

const ROWS = [
  { icon: Dumbbell, label: "Fitness", done: true },
  { icon: PersonStanding, label: "Pilates", done: true },
  { icon: Flower2, label: "Yoga", done: false },
];

export default function LoggingCard() {
  return (
    <BentoCard
      icon={Zap}
      title="Effortless logging"
      description="Clients log meals and workouts in seconds from a link — no app to install."
    >
      <div className="mx-auto w-[176px] rounded-[1.75rem] border-[6px] border-stone-900 bg-stone-50 p-3 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)]">
        <div className="space-y-2">
          {ROWS.map((r) => (
            <div key={r.label} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                  r.done ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                )}
                aria-hidden
              >
                <r.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="text-[11px] font-medium text-stone-700">{r.label}</span>
              {r.done && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.25} aria-hidden />}
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
