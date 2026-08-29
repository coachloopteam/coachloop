import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldStyles =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 " +
  "placeholder:text-stone-400 outline-none transition-all duration-200 ease-out " +
  "hover:border-stone-300 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldStyles, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldStyles, "resize-none", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";
