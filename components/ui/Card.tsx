import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export default function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200/80 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(0,0,0,0.12)]",
        interactive &&
          "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_28px_48px_-20px_rgba(0,0,0,0.16)]",
        className
      )}
      {...props}
    />
  );
}
