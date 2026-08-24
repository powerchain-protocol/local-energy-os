import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-950/5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="h-2 bg-emerald-800" />
        <div className="p-9 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">404 · Wayfinder</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">This energy route is not mapped</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">The page may have moved, or your role may not have access. Use the operations center or global map to continue.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Go to dashboard</Link><Link href="/map" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Open map</Link></div>
        </div>
      </section>
    </main>
  );
}
