import type { FirmwareRelease } from "@/types/hardware";
export function FirmwareTable({ releases }: { releases: FirmwareRelease[] }) {
  return <div className="grid gap-4 lg:grid-cols-3">{releases.map(item=><article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Firmware {item.version}</h3><span className="rounded-full border px-2 py-1 text-xs font-semibold capitalize">{item.channel}</span></div>
    <p className="mt-3 text-sm text-[var(--muted)]">Targets: {item.targetKinds.map(k=>k.replaceAll("-"," ")).join(", ")}</p>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-emerald-700" style={{width:`${item.rolloutPercent}%`}} /></div>
    <div className="mt-2 flex justify-between text-xs text-[var(--muted)]"><span>{item.rolloutPercent}% rollout</span><span>{item.signed?"Signed":"Unsigned"}</span></div>
  </article>)}</div>;
}
