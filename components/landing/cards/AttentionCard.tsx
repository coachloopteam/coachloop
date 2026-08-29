import { AlarmClock, CheckCircle2 } from "lucide-react";
import BentoCard from "../BentoCard";

export default function AttentionCard() {
  return (
    <BentoCard
      icon={AlarmClock}
      title="Never miss a client"
      description="Stale-activity alerts surface who's gone quiet before they fall off."
    >
      <div className="space-y-2 rounded-2xl border border-stone-100 bg-stone-50/60 p-3">
        <div className="flex cursor-default items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-[0_0_0_1.5px_rgba(16,185,129,0.35),0_12px_28px_-14px_rgba(16,185,129,0.3)]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500" aria-hidden>
              JM
            </span>
            <span className="text-xs font-medium text-stone-600">Jordan — active today</span>
          </div>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.5} aria-hidden />
        </div>

        <div className="flex cursor-default items-center justify-between rounded-xl border border-stone-200/70 bg-white px-3 py-2.5 transition-all duration-500 ease-in-out hover:scale-[1.01] hover:border-transparent hover:shadow-[0_0_0_1.5px_var(--accent),0_12px_28px_-14px_rgba(255,90,95,0.45)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500" aria-hidden>
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              </span>
              SC
            </span>
            <span className="text-xs font-medium text-stone-700">Sam — quiet 4 days</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
