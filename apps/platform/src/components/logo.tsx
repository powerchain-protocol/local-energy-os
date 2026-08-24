"use client";
import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[#0f5a46] shadow-[0_8px_22px_rgba(15,90,70,.2)]">
        <Image src="/logo-white.png" alt="PowerChain mark" width={34} height={34} className="h-8 w-8 object-contain" priority />
      </span>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[1.1rem] tracking-[-.035em]">
            <span className="font-semibold">Power</span><span className="font-light">Chain</span>
          </div>
          <div className="mt-0.5 truncate text-[10px] font-medium tracking-[.015em] text-[var(--muted)]">Digital Energy OS</div>
        </div>
      )}
    </div>
  );
}
