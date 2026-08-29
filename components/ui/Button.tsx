import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-[0_1px_2px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]",
  accent:
    "rounded-full text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-[0_4px_14px_-4px_rgba(255,90,95,0.5)] hover:shadow-[0_14px_28px_-8px_rgba(255,90,95,0.55)]",
  secondary:
    "rounded-full bg-white text-stone-800 border border-stone-200 hover:border-stone-300 hover:bg-stone-50",
  ghost: "rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "text-sm px-3.5 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

// Exported so non-<button> elements (Next <Link>, for instance) can look
// like a button without duplicating the variant/size logic.
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export default function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
