import type { ReactNode } from "react";
import { OperationalSectionLayout } from "../../components/operational-section-layout";

const items = [
  { label: "Live Flow", href: "/monitor/live-flow", icon: "flow" as const, description: "Synchronized site balance" },
  { label: "Generation", href: "/monitor/generation", icon: "generation" as const, description: "Output and evidence" },
  { label: "Consumption", href: "/monitor/consumption", icon: "consumption" as const, description: "Demand and intervals" },
  { label: "Storage", href: "/monitor/storage", icon: "storage" as const, description: "SOC, power and thermal state" },
];

export default function MonitorLayout({ children }: { children: ReactNode }) {
  return <OperationalSectionLayout section="Monitor" href="/monitor" description="Observe authoritative physical energy state, source identity, timestamps, quality and freshness before planning or execution." items={items}>{children}</OperationalSectionLayout>;
}
