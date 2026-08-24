"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/util";

type Network = "solana" | "sui";

const networkSources: Record<Network, string[]> = {
  solana: [
    "/assets/networks/solana.svg",
    "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    "https://cryptoicons.cc/128/color/sol.png"
  ],
  sui: [
    "/assets/networks/sui.svg",
    "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
    "https://cryptoicons.cc/128/color/sui.png"
  ]
};

export function Web3NetworkIcon({ network, size = 28, className }: { network: Network; size?: number; className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = networkSources[network];
  const src = sources[Math.min(sourceIndex, sources.length - 1)];

  return (
    <Image
      src={src}
      alt={`${network} network`}
      title={network === "solana" ? "Solana" : "Sui"}
      width={size}
      height={size}
      onError={() => setSourceIndex((index) => Math.min(index + 1, sources.length - 1))}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}
