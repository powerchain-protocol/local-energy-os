"use client";
import type { MarketQuote } from "@/energy/exchange";

export function MarketTable({ quotes }: { quotes: MarketQuote[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
    <table className="w-full min-w-[680px] text-sm">
      <caption className="sr-only">Energy exchange market quotes</caption>
      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
        <tr>{["Market","Bid","Ask","Last","24h","Volume"].map((h)=><th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {quotes.map((q)=><tr key={q.commodity} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/70">
          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{q.commodity.replaceAll("_", " ")}</td>
          <td className="px-4 py-3">{q.bid.toFixed(2)}</td><td className="px-4 py-3">{q.ask.toFixed(2)}</td><td className="px-4 py-3">{q.last.toFixed(2)}</td>
          <td className={`px-4 py-3 font-medium ${q.change24h >= 0 ? "text-emerald-600" : "text-red-600"}`}>{q.change24h >= 0 ? "+" : ""}{q.change24h}%</td>
          <td className="px-4 py-3">{q.volume24h.toLocaleString()}</td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}
