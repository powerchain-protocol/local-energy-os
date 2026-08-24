"use client";
import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <section className="panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><Icon className="h-6 w-6" /></span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="muted mt-2 max-w-md text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
