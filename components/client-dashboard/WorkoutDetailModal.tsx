"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, Clock, Package, Target, X } from "lucide-react";
import { cn } from "@/lib/cn";
import ConfettiBurst from "./ConfettiBurst";

// Illustrative detail content for the one workout currently in the day
// stream (MOCK_TASKS' Pilates session) — this concept doesn't have a real
// per-workout content model yet. See components/client-dashboard/mock-data.ts.
const SPECS = [
  { icon: Clock, label: "Duration", value: "40 min" },
  { icon: Target, label: "Focus", value: "Core & control" },
  { icon: Package, label: "Equipment", value: "Reformer" },
];

const STEPS = [
  "Breathe deeply and align your posture before you begin.",
  "Warm up with slow, controlled footwork on the reformer.",
  "Move through the hundred — steady breath, engaged core.",
  "Finish with controlled leg circles, both directions.",
];

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=1000&auto=format&fit=crop",
  alt: "Pilates reformer workout in a bright studio",
};

export default function WorkoutDetailModal({
  open,
  title,
  completed,
  onClose,
  onComplete,
}: {
  open: boolean;
  title: string;
  completed: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [justCompleted, setJustCompleted] = useState(false);
  // Portal target isn't available during SSR — render nothing until mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setJustCompleted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleComplete() {
    if (completed) return;
    onComplete();
    setJustCompleted(true);
    window.setTimeout(onClose, 1400);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 isolate flex items-end justify-center sm:items-center sm:p-4",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out sm:rounded-[2rem] sm:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 sm:translate-y-6"
        )}
      >
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-stone-300" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative h-56 w-full shrink-0 sm:h-64">
            <Image src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} fill sizes="480px" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" aria-hidden />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-stone-700 backdrop-blur-md transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          <div className="px-6 pb-6 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Pilates</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">{title}</h2>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {SPECS.map((s) => (
                <div key={s.label} className="rounded-2xl bg-stone-50 px-3 py-3.5 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-stone-400" strokeWidth={1.5} aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-stone-900">{s.value}</p>
                  <p className="text-xs text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">How to do it</h3>
              <div className="mt-4 space-y-6">
                {STEPS.map((step, i) => (
                  <div key={i} className="relative flex gap-4">
                    {i < STEPS.length - 1 && (
                      <span className="absolute left-4 top-9 h-[calc(100%+8px)] w-px bg-stone-200" aria-hidden />
                    )}
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-lg font-medium leading-snug text-stone-800">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-stone-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {justCompleted && <ConfettiBurst key="workout-modal-confetti" />}
          {completed || justCompleted ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-white">
              <Check className="animate-pop-in h-5 w-5" strokeWidth={2.5} aria-hidden />
              Nice work!
            </div>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full rounded-2xl bg-stone-900 py-4 text-lg font-bold text-white transition-all duration-300 ease-out hover:bg-stone-800 active:scale-[0.97]"
            >
              Complete Workout
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
