"use client";
import type { ReactNode } from "react";
export function StatCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon?: ReactNode }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><div className="flex items-center justify-between text-sm text-slate-500">{title}{icon}</div><p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{value}</p><p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{detail}</p></article>;
}
