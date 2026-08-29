import { Sparkles } from "lucide-react";
import BentoCard from "../BentoCard";
import RevealOnScroll from "../RevealOnScroll";

export default function FeedbackCard() {
  return (
    <BentoCard
      icon={Sparkles}
      title="Feedback in your voice"
      description="AI responses are grounded in the methodology you set, not generic advice."
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, var(--accent), #ffb27a)" }}
      >
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-md bg-white/90 px-3.5 py-2.5 text-xs leading-relaxed text-stone-800 shadow-sm">
            Rough day, skipped my workout.
          </div>
        </div>
        <RevealOnScroll delayMs={350} className="mt-2.5 flex justify-start">
          <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-white/30 bg-white/20 px-3.5 py-2.5 text-xs leading-relaxed text-white backdrop-blur-md">
            That&apos;s alright — tomorrow&apos;s a fresh start. Let&apos;s keep it simple.
          </div>
        </RevealOnScroll>
      </div>
    </BentoCard>
  );
}
