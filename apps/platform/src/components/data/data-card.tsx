import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/util";

export function DataCard({
  eyebrow,
  title,
  value,
  detail,
  icon,
  variant = "light",
  className,
  trend,
}: {
  eyebrow?: string;
  title: string;
  value?: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  variant?: "light" | "dark-green";
  className?: string;
  trend?: { value: string; direction?: "up" | "down" | "neutral" };
}) {
  const dark = variant === "dark-green";
  return (
    <article className={cn("group rounded-[20px] border p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5", dark ? "border-emerald-800 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-[0_18px_38px_rgba(6,78,59,.2)]" : "border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,.045)] hover:border-emerald-800/20 hover:shadow-[0_16px_38px_rgba(15,23,42,.075)]", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className={cn("text-[10px] font-semibold uppercase tracking-[.16em]", dark ? "text-emerald-200" : "text-emerald-700")}>{eyebrow}</p>}
          <h3 className="mt-1 text-sm font-semibold text-balance">{title}</h3>
          {value && <div className="mt-4 text-2xl font-semibold tracking-[-.035em] tabular-nums">{value}</div>}
          <div className="mt-2 flex min-h-5 flex-wrap items-center gap-2">
            {trend && <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", trend.direction === "down" ? "text-red-600 dark:text-red-300" : trend.direction === "neutral" ? (dark ? "text-emerald-100/70" : "text-[var(--muted)]") : (dark ? "text-emerald-100" : "text-emerald-700"))}>{trend.direction === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : trend.direction === "neutral" ? null : <ArrowUpRight className="h-3.5 w-3.5" />}{trend.value}</span>}
            {detail && <div className={cn("text-xs", dark ? "text-emerald-100/75" : "text-[var(--muted)]")}>{detail}</div>}
          </div>
        </div>
        {icon && <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[13px] transition-transform duration-200 group-hover:scale-105", dark ? "bg-white/10" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950")}>{icon}</div>}
      </div>
    </article>
  );
}
