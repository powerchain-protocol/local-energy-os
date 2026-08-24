export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
        <div className="h-9 w-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" />)}
        </div>
        <div className="h-[28rem] rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" />
      </div>
      <span className="sr-only">Loading PowerChain workspace</span>
    </main>
  );
}
