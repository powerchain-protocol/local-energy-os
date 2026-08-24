"use client";

import Image from "next/image";
import { useState } from "react";
import type { PowerChainAssetSymbol } from "@/constants/web3";
import { tokenAssetSources } from "@/utils/assets";
import { cn } from "@/utils/util";

const assetSources: Record<PowerChainAssetSymbol, string[]> = {
  PWRC: tokenAssetSources("PWRC").map(({ src }) => src),
  wPWRC: tokenAssetSources("wPWRC").map(({ src }) => src),
  CRT: tokenAssetSources("CRT").map(({ src }) => src),
  SOL: ["/assets/networks/solana.svg", "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png", "https://cryptoicons.cc/128/color/sol.png"],
  SUI: ["/assets/networks/sui.svg", "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png", "https://cryptoicons.cc/128/color/sui.png"],
  USDC: ["https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png", "https://cryptoicons.cc/128/color/usdc.png"]
};

const labels: Record<PowerChainAssetSymbol, string> = { PWRC: "PW", wPWRC: "wP", CRT: "CR", SOL: "SOL", SUI: "SUI", USDC: "$" };

export function AssetIcon({ symbol, size = 32, className = "" }: { symbol: PowerChainAssetSymbol; size?: number; className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = assetSources[symbol];
  const src = sources[sourceIndex];

  if (!src) {
    return (
      <span role="img" aria-label={`${symbol} token`} className={cn("grid shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[9px] font-extrabold", className)} style={{ width: size, height: size }}>
        {labels[symbol]}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${symbol} token`}
      width={size}
      height={size}
      onError={() => setSourceIndex((index) => index + 1)}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}
