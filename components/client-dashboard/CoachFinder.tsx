"use client";

import { useMemo, useState } from "react";
import { Dumbbell, Flower2, PersonStanding, Search, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Specialty = "fitness" | "pilates" | "yoga";
type PriceTier = "$" | "$$" | "$$$";
type Style = "High-Intensity" | "Mindful & Slow" | "Data-Driven" | "Holistic";

type Coach = {
  id: string;
  name: string;
  specialty: Specialty;
  priceTier: PriceTier;
  style: Style;
  rating: number;
  bio: string;
  gradient: string;
};

const SPECIALTY_ICON: Record<Specialty, LucideIcon> = {
  fitness: Dumbbell,
  pilates: PersonStanding,
  yoga: Flower2,
};

const SPECIALTY_LABEL: Record<Specialty, string> = {
  fitness: "Fitness",
  pilates: "Pilates",
  yoga: "Yoga",
};

// Fabricated demo profiles for this concept marketplace grid — this
// product actually pairs each client with exactly one coach 1:1, with no
// multi-coach browsing (see AGENTS.md / product model). Kept out of the
// real client dashboard; only reachable under /design/. Gradient
// initials avatars are used instead of stock photography so no real
// person's likeness is attached to a fabricated profile.
const COACHES: Coach[] = [
  {
    id: "c1",
    name: "Alex Rivera",
    specialty: "fitness",
    priceTier: "$$",
    style: "Data-Driven",
    rating: 4.9,
    bio: "Strength & conditioning coach focused on progressive overload and measurable weekly gains.",
    gradient: "linear-gradient(135deg, #1c1c1e, #46464a)",
  },
  {
    id: "c2",
    name: "Priya Nandan",
    specialty: "pilates",
    priceTier: "$$$",
    style: "Mindful & Slow",
    rating: 5.0,
    bio: "Reformer specialist building core control and posture through precise, unhurried sessions.",
    gradient: "linear-gradient(135deg, var(--accent), #ff8a65)",
  },
  {
    id: "c3",
    name: "Marcus Webb",
    specialty: "fitness",
    priceTier: "$$$",
    style: "High-Intensity",
    rating: 4.8,
    bio: "Former athlete running conditioning circuits for clients training for performance, not just aesthetics.",
    gradient: "linear-gradient(135deg, #46464a, #1c1c1e)",
  },
  {
    id: "c4",
    name: "Sofia Lindqvist",
    specialty: "yoga",
    priceTier: "$",
    style: "Holistic",
    rating: 4.9,
    bio: "Vinyasa and breathwork teacher pairing mobility work with recovery and stress management.",
    gradient: "linear-gradient(135deg, #5b6a55, #8ea27f)",
  },
  {
    id: "c5",
    name: "Daniel Osei",
    specialty: "pilates",
    priceTier: "$$",
    style: "Data-Driven",
    rating: 4.7,
    bio: "Tracks alignment and range-of-motion progress session to session for clients rebuilding after injury.",
    gradient: "linear-gradient(135deg, #ff8a65, var(--accent))",
  },
  {
    id: "c6",
    name: "Hana Kobayashi",
    specialty: "yoga",
    priceTier: "$$",
    style: "Mindful & Slow",
    rating: 5.0,
    bio: "Restorative and yin-focused practice for clients who want recovery built into their week.",
    gradient: "linear-gradient(135deg, #8ea27f, #5b6a55)",
  },
];

const SPECIALTIES: Specialty[] = ["fitness", "pilates", "yoga"];
const PRICE_TIERS: PriceTier[] = ["$", "$$", "$$$"];
const STYLES: Style[] = ["High-Intensity", "Mindful & Slow", "Data-Driven", "Holistic"];

export default function CoachFinder() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [priceTier, setPriceTier] = useState<PriceTier | null>(null);
  const [style, setStyle] = useState<Style | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COACHES.filter((c) => {
      if (specialty && c.specialty !== specialty) return false;
      if (priceTier && c.priceTier !== priceTier) return false;
      if (style && c.style !== style) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.bio.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, specialty, priceTier, style]);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]">
      <div className="border-b border-stone-100 p-5">
        <h2 className="text-lg font-bold tracking-tight text-stone-900">Discover Elite Coaches</h2>
        <p className="mt-1 text-sm text-stone-500">Concept marketplace — search and filter by specialty, price, and style.</p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
          <Search className="h-4.5 w-4.5 shrink-0 text-stone-400" strokeWidth={1.5} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coaches by name or focus"
            className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={specialty === null} onClick={() => setSpecialty(null)} label="All Specialties" />
            {SPECIALTIES.map((s) => (
              <FilterChip key={s} active={specialty === s} onClick={() => setSpecialty((cur) => (cur === s ? null : s))} label={SPECIALTY_LABEL[s]} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRICE_TIERS.map((p) => (
              <FilterChip key={p} active={priceTier === p} onClick={() => setPriceTier((cur) => (cur === p ? null : p))} label={p} />
            ))}
            {STYLES.map((s) => (
              <FilterChip key={s} active={style === s} onClick={() => setStyle((cur) => (cur === s ? null : s))} label={s} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        {results.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-400">No coaches match those filters.</p>
        ) : (
          results.map((c) => {
            const Icon = SPECIALTY_ICON[c.specialty];
            return (
              <div
                key={c.id}
                className="group rounded-2xl border border-stone-100 p-4 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-stone-200 hover:shadow-[0_16px_32px_-18px_rgba(0,0,0,0.16)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: c.gradient }}
                    aria-hidden
                  >
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-stone-900">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-stone-400">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      {SPECIALTY_LABEL[c.specialty]} · {c.style}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-stone-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} aria-hidden />
                    {c.rating.toFixed(1)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{c.bio}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-700">{c.priceTier} tier</span>
                  <span className="rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
                    View Profile
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ease-out active:scale-95",
        active ? "border-transparent bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-300"
      )}
    >
      {label}
    </button>
  );
}
