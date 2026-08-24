import Link from "next/link";
import type { ReactNode } from "react";

export function DocCard({ title, description, href, icon, badge }: { title: string; description: string; href: string; icon: ReactNode; badge?: string }) {
  return <Link href={href} className="group rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/25 hover:shadow-lg dark:bg-[var(--surface)]">
    <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-950 text-white shadow-sm">{icon}</span>{badge&&<span className="rounded-full border border-emerald-800/15 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">{badge}</span>}</div>
    <h2 className="mt-5 text-lg font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p><span className="mt-5 inline-flex text-sm font-semibold text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-400">Open reference →</span>
  </Link>
}
