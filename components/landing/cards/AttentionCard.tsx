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
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500" aria-hidden>
              JM
            </span>
            <span className="text-xs font-medium text-stone-600">Jordan — active today</span>
          </div>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.75} aria-hidden />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-700" aria-hidden>
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
              SC
            </span>
            <span className="text-xs font-medium text-amber-900">Sam — quiet 4 days</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
