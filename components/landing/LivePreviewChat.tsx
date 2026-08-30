"use client";

import { useEffect, useState } from "react";

type Stage = "idle" | "client" | "typing" | "reply";

const CLIENT_DELAY_MS = 500;
const TYPING_DELAY_MS = 700;
const REPLY_DELAY_MS = 1500;

export default function LivePreviewChat() {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage("client"), CLIENT_DELAY_MS),
      window.setTimeout(() => setStage("typing"), CLIENT_DELAY_MS + TYPING_DELAY_MS),
      window.setTimeout(() => setStage("reply"), CLIENT_DELAY_MS + TYPING_DELAY_MS + REPLY_DELAY_MS),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="mt-7 space-y-3">
      {stage !== "idle" && (
        <div className="animate-fade-in-up flex justify-end">
          <div className="max-w-[78%] rounded-3xl rounded-br-lg bg-white px-5 py-3.5 text-stone-900 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">Client · today</p>
            <p className="mt-1 text-sm leading-relaxed">Skipped my run this morning, felt drained.</p>
          </div>
        </div>
      )}

      {/* A brief "typing" beat before the reply, so it reads as a considered
          response rather than an instant auto-reply. */}
      {stage === "typing" && (
        <div className="animate-fade-in flex justify-start">
          <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {stage === "reply" && (
        <div className="flex justify-start">
          <div className="animate-scale-fade-in max-w-[85%] origin-bottom-left rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-md">
            <p className="text-xs font-semibold text-white/50">Feedback, in your coach&apos;s voice</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/90">
              Totally fine — rest when your body asks for it. Let&apos;s pick the plan back up tomorrow, no
              guilt needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
