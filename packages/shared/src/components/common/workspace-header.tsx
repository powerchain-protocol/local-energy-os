"use client";
import type { ReactNode } from "react";

export function WorkspaceHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{description}</p></div>{actions}</header>;
}
