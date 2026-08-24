"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/cn";

export type TabItem = { label: string; href: string; badge?: string };

export function Tabs({ items, label = "Section navigation" }: { items: TabItem[]; label?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="no-scrollbar overflow-x-auto overscroll-x-contain pb-1">
      <div className="inline-flex min-w-full snap-x snap-mandatory gap-1 rounded-[16px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,var(--bg))] p-1.5 shadow-[0_8px_24px_rgba(15,23,42,.035)] sm:min-w-0">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative snap-start whitespace-nowrap rounded-[11px] px-3.5 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/15",
                active
                  ? "bg-emerald-900 text-white shadow-[0_5px_14px_rgba(6,78,59,.16)]"
                  : "text-[var(--muted)] hover:bg-black/[.045] hover:text-[var(--text)] dark:hover:bg-white/[.06]",
              )}
            >
              {item.label}
              {item.badge && <span className={cn("ml-2 rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-white/15" : "bg-black/[.06] dark:bg-white/10")}>{item.badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
