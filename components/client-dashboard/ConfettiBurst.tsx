"use client";

import type { CSSProperties } from "react";

const COLORS = ["var(--accent)", "#ff8a65", "#34d399", "#fbbf24"];
const PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 46 + (i % 3) * 10;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    color: COLORS[i % COLORS.length],
    delay: (i % 4) * 30,
  };
});

// Remount this (change its `key` prop) to retrigger the burst.
export default function ConfettiBurst() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-confetti-burst absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          style={
            {
              backgroundColor: p.color,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
