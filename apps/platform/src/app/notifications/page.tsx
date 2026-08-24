import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Shell } from "@/components/shell";

const notifications = [
  { title: "Meter verification completed", detail: "North Ridge Solar evidence passed the active Proof of Energy policy.", icon: CheckCircle2, tone: "text-emerald-700" },
  { title: "Order awaiting signature", detail: "A marketplace reservation is ready for wallet authorization.", icon: Info, tone: "text-sky-700" },
  { title: "Telemetry requires review", detail: "Gateway GW-07 reported delayed observations during its last health window.", icon: AlertTriangle, tone: "text-amber-700" },
];

export default function NotificationsPage() {
  return <Shell><main className="content-container"><header><p className="eyebrow">Activity center</p><h1 className="page-title">Notifications</h1><p className="page-subtitle">Operational, marketplace, and verification updates for your workspace.</p></header><section className="panel mt-6 divide-y divide-[var(--border)]">{notifications.map(({title,detail,icon:Icon,tone})=><article key={title} className="flex gap-4 p-5"><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} aria-hidden/><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{detail}</p></div></article>)}</section></main></Shell>;
}
