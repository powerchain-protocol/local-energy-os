"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("PowerChain route error", error); }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-950/5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-2xl dark:bg-red-950/40">!</div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PowerChain</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Workspace unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">The workspace could not be rendered. Retry safely or return to the operations center.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-7 flex justify-center gap-3"><button onClick={reset} className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Try again</button><Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Operations center</Link></div>
      </section>
    </main>
  );
}
