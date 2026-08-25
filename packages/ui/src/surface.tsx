import type { ReactNode } from "react";
import { PowerChainIcon, type PowerChainIconName } from "./icons";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="pc-page-header"><div>{eyebrow ? <p className="pc-eyebrow">{eyebrow}</p> : null}<h1>{title}</h1>{description ? <p className="pc-page-description">{description}</p> : null}</div>{action ? <div className="pc-page-actions">{action}</div> : null}</header>;
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="pc-section-header"><div>{eyebrow ? <p className="pc-eyebrow">{eyebrow}</p> : null}<h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{action ? <div>{action}</div> : null}</div>;
}

export function StatCard({ label, value, unit, meta, status, icon }: { label: string; value: ReactNode; unit?: string; meta?: string; status?: "positive" | "warning" | "neutral"; icon?: PowerChainIconName }) {
  return <section className="pc-stat-card">{icon ? <span className="pc-stat-icon"><PowerChainIcon name={icon}/></span> : null}<p>{label}</p><div className="pc-stat-value">{value}{unit ? <small>{unit}</small> : null}</div>{meta ? <span className={`pc-stat-meta ${status ? `is-${status}` : ""}`}>{meta}</span> : null}</section>;
}

export function Panel({ title, eyebrow, description, action, children, className = "" }: { title?: string; eyebrow?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`pc-panel ${className}`}><div className="pc-panel-head"><div>{eyebrow ? <p className="pc-eyebrow">{eyebrow}</p> : null}{title ? <h2>{title}</h2> : null}{description ? <p>{description}</p> : null}</div>{action}</div>{children}</section>;
}

export function StatusBadge({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={`pc-status-badge is-${tone}`}><span />{children}</span>;
}

export function EmptyState({ icon = "status", title, description, action }: { icon?: PowerChainIconName; title: string; description: string; action?: ReactNode }) {
  return <div className="pc-empty-state"><span className="pc-empty-icon"><PowerChainIcon name={icon}/></span><strong>{title}</strong><p>{description}</p>{action ? <div className="pc-empty-action">{action}</div> : null}</div>;
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return <div className="pc-skeleton" aria-hidden="true">{Array.from({ length: lines }, (_, index) => <span key={index} style={{ width: `${92 - index * 13}%` }} />)}</div>;
}

export function InlineNotice({ title, children, tone = "info", icon = "status" }: { title: string; children: ReactNode; tone?: "info" | "warning" | "danger" | "success"; icon?: PowerChainIconName }) {
  return <div className={`pc-inline-notice is-${tone}`} role={tone === "danger" ? "alert" : "status"}><span className="pc-inline-notice-icon"><PowerChainIcon name={icon}/></span><div><strong>{title}</strong><p>{children}</p></div></div>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, max <= 0 ? 0 : (value / max) * 100));
  return <div className="pc-progress-wrap">{label ? <div className="pc-progress-label"><span>{label}</span><span>{Math.round(normalized)}%</span></div> : null}<div className="pc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}><span style={{ width: `${normalized}%` }} /></div></div>;
}

export function LifecycleStep({ icon, label, value, unit, state = "complete" }: { icon: PowerChainIconName; label: string; value: ReactNode; unit?: string; state?: "complete" | "active" | "muted" }) {
  return <div className={`pc-lifecycle-step is-${state}`}><span className="pc-lifecycle-icon"><PowerChainIcon name={icon}/></span><div><small>{label}</small><strong>{value}{unit ? <em>{unit}</em> : null}</strong></div></div>;
}

export function ActionCard({ icon, title, description, meta, href }: { icon: PowerChainIconName; title: string; description: string; meta?: string; href?: string }) {
  const body = <><span className="pc-action-card-icon"><PowerChainIcon name={icon}/></span><span className="pc-action-card-copy"><strong>{title}</strong><p>{description}</p>{meta ? <small>{meta}</small> : null}</span><PowerChainIcon name="arrow" /></>;
  return href ? <a className="pc-action-card" href={href}>{body}</a> : <div className="pc-action-card is-static">{body}</div>;
}
