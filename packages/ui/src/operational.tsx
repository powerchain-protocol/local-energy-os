import type { ReactNode } from "react";
import { PowerChainIcon, type PowerChainIconName } from "./icons";
import { StatusBadge } from "./surface";

export function OperationalMetric({ icon, label, value, unit, status = "neutral", meta }: {
  icon: PowerChainIconName; label: string; value: ReactNode; unit?: string; status?: "success" | "warning" | "danger" | "info" | "neutral"; meta?: ReactNode;
}) {
  return <section className="pc-operational-metric" data-slot="operational-metric">
    <header><span><PowerChainIcon name={icon}/>{label}</span><StatusBadge tone={status}>{status.toUpperCase()}</StatusBadge></header>
    <div><strong>{value}</strong>{unit ? <small>{unit}</small> : null}</div>{meta ? <p>{meta}</p> : null}
  </section>;
}

export function SourceMetadata({ source, observedAt, receivedAt, freshness, quality }: {
  source: string; observedAt?: string; receivedAt?: string; freshness: string; quality: string;
}) {
  return <dl className="pc-source-metadata" data-slot="source-metadata">
    <div><dt>Source</dt><dd>{source}</dd></div><div><dt>Observed</dt><dd>{observedAt ?? "Unavailable"}</dd></div>
    <div><dt>Received</dt><dd>{receivedAt ?? "Unavailable"}</dd></div><div><dt>Freshness</dt><dd>{freshness}</dd></div><div><dt>Quality</dt><dd>{quality}</dd></div>
  </dl>;
}

export function OperationalGate({ title, allowed, reason, children }: { title: string; allowed: boolean; reason?: string; children?: ReactNode }) {
  return <section className={`pc-operational-gate ${allowed ? "is-allowed" : "is-blocked"}`} data-slot="operational-gate">
    <header><strong>{title}</strong><StatusBadge tone={allowed ? "success" : "danger"}>{allowed ? "ALLOWED" : "BLOCKED"}</StatusBadge></header>
    {reason ? <p>{reason}</p> : null}{children}
  </section>;
}


export function OperationalStatusCard({ icon, title, status, description, children }: { icon: PowerChainIconName; title: string; status: "success" | "warning" | "danger" | "info" | "neutral"; description?: string; children?: ReactNode }) {
  return <section className="pc-operational-status-card" data-slot="operational-status-card"><header><span><PowerChainIcon name={icon}/><strong>{title}</strong></span><StatusBadge tone={status}>{status.toUpperCase()}</StatusBadge></header>{description ? <p>{description}</p> : null}{children}</section>;
}
export function SourceBadge({ source }: { source: string }) { return <StatusBadge tone="neutral">{source}</StatusBadge>; }
export const SafeActionPanel = OperationalGate;
