"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";

// A premium media-player WIREFRAME — there is no video file behind this
// anywhere in the app (see components/concept/MediaHub.tsx's honest
// "coming soon" note on the guided-session skeleton), so play/pause and
// the progress bar are locally simulated state, not real playback. Built
// with full interactive control chrome as requested, but the label at the
// bottom keeps it from ever claiming to be real footage.
//
// Reveals via pure CSS on desktop hover (the parent card just needs a
// `group` class) and via `open` (tap-to-toggle, lifted into the parent's
// state) as the touch-device fallback, since hover doesn't exist there.
export default function GuidedPreviewOverlay({
  title,
  note,
  open,
}: {
  title: string;
  note: string;
  open: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.6));
      }, 60);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [playing]);

  return (
    <div
      className={cn(
        // pointer-events-none while hidden — otherwise this layer (z-10,
        // covering the full card) silently intercepts every click even at
        // opacity-0, and the card underneath never receives the tap that's
        // supposed to open it.
        "absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/75 to-black/40 p-4 opacity-0 backdrop-blur-sm transition-all duration-700 ease-out pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
        open && "pointer-events-auto opacity-100"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Guided Preview</p>
      <p className="mt-1 text-sm font-bold leading-snug text-white">{title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/50">{note}</p>

      <div
        className="mt-3 rounded-xl border border-slate-100/20 bg-white/5 p-3 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), #ff8a65)" }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-stone-900 transition-transform duration-300 ease-out active:scale-90"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" strokeWidth={1.2} fill="currentColor" aria-hidden />
            ) : (
              <Play className="h-3.5 w-3.5" strokeWidth={1.2} fill="currentColor" aria-hidden />
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-white/50" strokeWidth={1.2} aria-hidden />
            <input
              type="range"
              defaultValue={70}
              aria-label="Volume"
              className="h-1 w-14 accent-white"
            />
          </div>
        </div>

        <p className="mt-2.5 text-center text-[10px] font-medium text-white/30">
          Preview only — full guided sessions coming soon
        </p>
      </div>
    </div>
  );
}
