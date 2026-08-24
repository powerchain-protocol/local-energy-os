"use client";

import { usePathname } from "next/navigation";
import { NAVIGATION_GROUPS } from "@/constants/navigation";

const fallback = {
  title: "PowerChain Dashboard",
  eyebrow: "Digital Energy OS",
  description: "Operate physical energy, verified Energy RWA, local markets and multi-network infrastructure.",
};

export function usePageMeta() {
  const pathname = usePathname();
  const item = NAVIGATION_GROUPS.flatMap((group) => group.items)
    .sort((a, b) => b.href.length - a.href.length)
    .find(({ href }) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)));

  return {
    ...fallback,
    title: item?.label ?? fallback.title,
    description: item?.description ?? fallback.description,
    pathname,
  };
}
