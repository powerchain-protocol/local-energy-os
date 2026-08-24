"use client";

import Image from "next/image";

const tokens = {
  pwrc: { name: "PowerChain", symbol: "PWRC", subtitle: "Utility & governance token", image: "/assets/tokens/pwrc.png", balance: "1,245,678.90", value: "$24,913,578" },
  wpwrc: { name: "Wrapped PowerChain", symbol: "wPWRC", subtitle: "Sui bridge representation", image: "/assets/tokens/wpwrc-sui.png", balance: "245,678.90", value: "$491,358" },
  crt: { name: "Carbon Credit Token", symbol: "CRT", subtitle: "Tokenized verified carbon credits", image: "/assets/tokens/crt.png", balance: "128,450", value: "128,450 tCO₂e" },
} as const;

export function TokenCard({ kind }: { kind: keyof typeof tokens }) {
  const token = tokens[kind];
  return <article className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-950"><Image src={token.image} alt={`${token.name} token`} width={72} height={72} className="h-16 w-16 rounded-full object-cover"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{token.symbol}</h3><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Verified</span></div><p className="truncate text-xs text-slate-500">{token.subtitle}</p><p className="mt-2 text-lg font-bold">{token.balance}</p><p className="text-xs text-slate-500">{token.value}</p></div></article>;
}
