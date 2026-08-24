"use client";

import Image from "next/image";
import { BackpackIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils/util";

const walletIcons: Record<string, string> = {
  phantom: "/assets/wallets/phantom.svg",
  solflare: "/assets/wallets/solflare.svg",
  backpack: "/assets/wallets/backpack.svg",
  glow: "/assets/wallets/glow.svg"
};

export function Web3WalletIcon({
  name,
  size = 28,
  className
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = walletIcons[name.trim().toLowerCase()];

  if (icon) {
    return (
      <Image
        src={icon}
        alt={`${name} wallet`}
        title={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} wallet`}
      title={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <BackpackIcon style={{ width: Math.max(14, size * 0.55), height: Math.max(14, size * 0.55) }} />
    </span>
  );
}
