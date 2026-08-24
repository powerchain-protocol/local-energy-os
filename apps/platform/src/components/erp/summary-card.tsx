"use client";
export function ErpSummaryCard({ title, value, detail }: { title:string; value:string; detail:string }) { return <article className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></article>; }
