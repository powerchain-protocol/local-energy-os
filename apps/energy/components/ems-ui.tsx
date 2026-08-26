import type { ReactNode } from "react";
import { PowerChainIcon, StatusBadge, type PowerChainIconName } from "@powerchain/ui";

export type EmsFreshness = "LIVE" | "FRESH" | "STALE" | "RECONNECTING" | "DEGRADED" | "OFFLINE" | "SIMULATED" | "UNCONFIGURED";

function tone(state: EmsFreshness): "success" | "warning" | "danger" | "info" | "neutral" {
  if (state === "LIVE" || state === "FRESH") return "success";
  if (state === "STALE" || state === "RECONNECTING" || state === "DEGRADED") return "warning";
  if (state === "OFFLINE") return "danger";
  if (state === "SIMULATED") return "info";
  return "neutral";
}

export function EmsFreshnessBadge({ state }: { state: EmsFreshness }) {
  return <StatusBadge tone={tone(state)}>{state}</StatusBadge>;
}

export function EmsMetric({ icon, label, value, unit, meta, freshness = "UNCONFIGURED", timestamp }: {
  icon: PowerChainIconName;
  label: string;
  value: ReactNode;
  unit?: string;
  meta: string;
  freshness?: EmsFreshness;
  timestamp?: string;
}) {
  return <section className="ems-metric">
    <div className="ems-metric-head"><span className="ems-metric-icon"><PowerChainIcon name={icon}/></span><EmsFreshnessBadge state={freshness}/></div>
    <span className="ems-metric-label">{label}</span>
    <div className="ems-metric-value">{value}{unit ? <small>{unit}</small> : null}</div>
    <p>{meta}</p>
    <div className="ems-metric-time"><PowerChainIcon name="clock"/><span>{timestamp ?? "No source timestamp"}</span></div>
  </section>;
}

export type FlowValue = { label: string; value?: string; unit: string; state?: EmsFreshness; meta: string; icon: PowerChainIconName };

function FlowNode({ item, className = "" }: { item: FlowValue; className?: string }) {
  return <div className={`ems-flow-node ${className}`}>
    <div className="ems-flow-node-head"><span><PowerChainIcon name={item.icon}/>{item.label}</span><EmsFreshnessBadge state={item.state ?? "UNCONFIGURED"}/></div>
    <strong>{item.value ?? "—"}<small>{item.unit}</small></strong>
    <p>{item.meta}</p>
  </div>;
}

export function EmsFlowBoard({ generation, demand, storage, grid, timestamp }: {
  generation: FlowValue;
  demand: FlowValue;
  storage: FlowValue;
  grid: FlowValue;
  timestamp?: string;
}) {
  return <div className="ems-flow-board">
    <div className="ems-flow-timestamp"><PowerChainIcon name="clock"/><span>State timestamp</span><strong>{timestamp ?? "Unavailable"}</strong></div>
    <div className="ems-flow-canvas">
      <FlowNode item={generation} className="is-generation"/>
      <div className="ems-flow-connector is-a" aria-hidden="true"><span/></div>
      <div className="ems-flow-hub"><span className="ems-flow-hub-mark"><PowerChainIcon name="energy"/></span><small>Site bus</small><strong>Physical state</strong><em>Authoritative telemetry required</em></div>
      <div className="ems-flow-connector is-b" aria-hidden="true"><span/></div>
      <FlowNode item={demand} className="is-demand"/>
      <div className="ems-flow-connector is-c" aria-hidden="true"><span/></div>
      <FlowNode item={storage} className="is-storage"/>
      <div className="ems-flow-connector is-d" aria-hidden="true"><span/></div>
      <FlowNode item={grid} className="is-grid"/>
    </div>
    <div className="ems-flow-legend"><span><i className="is-live"/>Fresh physical data</span><span><i className="is-stale"/>Stale/degraded</span><span><i/>Unconfigured / unavailable</span></div>
  </div>;
}

export function EmsMetadataContract({ items }: { items: Array<{ label: string; value: ReactNode; meta?: string }> }) {
  return <dl className="ems-metadata-contract">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}{item.meta ? <small>{item.meta}</small> : null}</dd></div>)}</dl>;
}

export function EmsSafetyRail({ current = -1 }: { current?: number }) {
  const stages = [
    ["Context", "Validated physical state and target"],
    ["Simulate", "Forecast resulting energy/grid state"],
    ["Policy", "Limits, permissions and risk gates"],
    ["Approve", "Human or configured approval policy"],
    ["Execute", "Bounded dispatch through approved adapter"],
    ["Verify", "Post-action telemetry and audit evidence"],
  ];
  return <ol className="ems-safety-rail">{stages.map(([label, description], index) => <li key={label} className={index < current ? "is-complete" : index === current ? "is-active" : ""}>
    <span>{index < current ? "✓" : index + 1}</span><div><strong>{label}</strong><p>{description}</p></div>
  </li>)}</ol>;
}

export function EmsBoundaryCard({ icon, title, description, state = "UNCONFIGURED", children }: {
  icon: PowerChainIconName;
  title: string;
  description: string;
  state?: EmsFreshness;
  children?: ReactNode;
}) {
  return <section className="ems-boundary-card"><div className="ems-boundary-card-head"><span><PowerChainIcon name={icon}/></span><EmsFreshnessBadge state={state}/></div><strong>{title}</strong><p>{description}</p>{children}</section>;
}

export function EmsRequirements({ title = "Required operational metadata", items }: { title?: string; items: Array<{ label: string; value: string }> }) {
  return <section className="ems-requirements"><header><PowerChainIcon name="shield"/><div><strong>{title}</strong><p>PowerChain does not promote data to operational state without these fields.</p></div></header><div>{items.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></section>;
}
