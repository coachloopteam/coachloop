import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export default function BentoCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_32px_64px_-28px_rgba(255,90,95,0.3)] sm:p-7",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1.5px var(--accent)" }}
        aria-hidden
      />
      <span
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, var(--accent), #ff8a65)" }}
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
