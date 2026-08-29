import RevealOnScroll from "./RevealOnScroll";
import LoggingCard from "./cards/LoggingCard";
import FeedbackCard from "./cards/FeedbackCard";
import AttentionCard from "./cards/AttentionCard";

export default function FeatureBentoGrid() {
  return (
    <section id="features" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Everything runs itself, in your voice
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-500">
            No dashboards to babysit. No jargon to learn.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <RevealOnScroll delayMs={0}>
            <LoggingCard />
          </RevealOnScroll>
          <RevealOnScroll delayMs={120}>
            <FeedbackCard />
          </RevealOnScroll>
          <RevealOnScroll delayMs={240} className="sm:col-span-2 lg:col-span-1">
            <AttentionCard />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
