import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "outline" | "dark-green" | "info";
const variants: Record<BadgeVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/45 dark:text-amber-200",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-200",
  neutral: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  outline: "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
  "dark-green": "border-emerald-900 bg-emerald-900 text-white",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/45 dark:text-sky-200",
};

export function Badge({ variant = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", variants[variant], className)} {...props} />;
}
