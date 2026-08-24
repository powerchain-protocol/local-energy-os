import type { HardwareDevice } from "@/types/hardware";

const statusClass: Record<HardwareDevice["status"], string> = {
  online: "bg-emerald-100 text-emerald-800",
  offline: "bg-rose-100 text-rose-800",
  maintenance: "bg-amber-100 text-amber-800",
  provisioning: "bg-sky-100 text-sky-800",
};

export function DeviceTable({ devices }: { devices: HardwareDevice[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
    <table className="w-full min-w-[860px] text-left text-sm">
      <thead className="border-b border-[var(--border)] bg-black/[.025] text-xs uppercase tracking-wide text-[var(--muted)]"><tr>
        <th className="px-4 py-3">Device</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Site</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Firmware</th><th className="px-4 py-3">Status</th>
      </tr></thead>
      <tbody>{devices.map(device=><tr key={device.id} className="border-b border-[var(--border)] last:border-0">
        <td className="px-4 py-4"><div className="font-semibold">{device.name}</div><div className="text-xs text-[var(--muted)]">{device.manufacturer} {device.model} · {device.serialNumber}</div></td>
        <td className="px-4 py-4 capitalize">{device.kind.replaceAll("-"," ")}</td><td className="px-4 py-4">{device.site}</td><td className="px-4 py-4 uppercase">{device.network}</td><td className="px-4 py-4">{device.firmwareVersion}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[device.status]}`}>{device.status}</span></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
