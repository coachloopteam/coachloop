"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, MessageCircle, Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export type ClientRow = {
  id: string;
  name: string;
  hasAccount: boolean;
  status: string;
  statusKind: "lead" | "stale" | "good" | "recent" | "none";
};

type FilterKey = "all" | "active" | "attention" | "lead";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "attention", label: "Needs Attention" },
  { key: "lead", label: "Leads" },
];

// Search + status filter over the coach's OWN existing clients — not a
// lead-generation marketplace. This product pairs each client with exactly
// one coach; there's no pool of prospective clients to browse (see
// AGENTS.md / product model). "Leads" here means real
// coach_client_assignments rows with status='lead' (an invited client who
// hasn't started yet) — see app/coach/page.tsx — not prospects sourced
// from anywhere external.
export default function ClientFinder({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (filter === "active" && !(c.statusKind === "good" || c.statusKind === "recent")) return false;
      if (filter === "attention" && !(c.statusKind === "lead" || c.statusKind === "stale")) return false;
      if (filter === "lead" && c.statusKind !== "lead") return false;
      return true;
    });
  }, [clients, query, filter]);

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
        <Search className="h-4.5 w-4.5 shrink-0 text-stone-400" strokeWidth={1.5} aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your clients by name"
          className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-stone-100 px-5 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-out active:scale-95",
              filter === f.key ? "border-transparent bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="px-5 py-8 text-center text-base text-stone-400">No clients match that search.</p>}

      <div className="divide-y divide-stone-100">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/coach/clients/${c.id}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-stone-50/70"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
              aria-hidden
            >
              {c.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-base font-semibold text-stone-900">
                <span className="truncate">{c.name}</span>
                {c.hasAccount && (
                  <span title="Has saved a login — signs in directly instead of using their link">
                    <Badge variant="neutral" className="shrink-0 gap-1 px-2 py-0.5">
                      <KeyRound className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                      Account
                    </Badge>
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-stone-500">{c.status}</p>
            </div>
            {c.statusKind === "good" && (
              <span title="Doing great">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={1.75} aria-hidden />
              </span>
            )}
            <MessageCircle className="h-4.5 w-4.5 shrink-0 text-stone-300" strokeWidth={1.5} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
