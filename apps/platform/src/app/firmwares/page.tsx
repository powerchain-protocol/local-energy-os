import { FirmwareTable } from "@/components/hardware";
import { firmwareReleases } from "@/data/hardware";
export default function FirmwaresPage(){return <main className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Device lifecycle</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Firmware management</h1><p className="mt-2 text-[var(--muted)]">Stage signed releases, control rollout channels, and monitor deployment progress.</p></div><FirmwareTable releases={firmwareReleases}/></main>}
