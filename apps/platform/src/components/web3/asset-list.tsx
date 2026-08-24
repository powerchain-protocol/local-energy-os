"use client";
import { AssetIcon } from "./asset-icon";
import { POWERCHAIN_ASSETS } from "@/constants/web3";

const balances: Record<string, string> = { PWRC: "1,245,678.90", wPWRC: "245,678.90", CRT: "128,450", SOL: "842.19", SUI: "18,920.00", USDC: "2,480,300.00" };

export function AssetList() {
  return <section className="panel overflow-hidden"><div className="border-b border-[var(--border)] p-5"><h2 className="font-bold">Treasury assets</h2><p className="mt-1 text-sm muted">PowerChain, Solana and Sui balances</p></div><div className="divide-y divide-[var(--border)]">{POWERCHAIN_ASSETS.map(asset=><div key={asset.symbol} className="flex items-center gap-3 px-5 py-4"><AssetIcon symbol={asset.symbol} size={38}/><div className="min-w-0 flex-1"><div className="font-semibold">{asset.symbol}</div><div className="truncate text-xs muted">{asset.name} · {asset.network}</div></div><div className="text-right font-semibold tabular-nums">{balances[asset.symbol]}</div></div>)}</div></section>;
}
