import type { ReactNode } from "react";
import { OperationalSectionLayout } from "../../components/operational-section-layout";

const items = [
  { label: "Forecast", href: "/operate/forecast", icon: "forecast" as const, description: "Expected state and confidence" },
  { label: "Flexibility", href: "/operate/flexibility", icon: "flexibility" as const, description: "Available operating envelope" },
  { label: "Dispatch", href: "/operate/dispatch", icon: "dispatch" as const, description: "Safe-action preparation" },
  { label: "Grid", href: "/operate/grid", icon: "grid" as const, description: "Topology and constraints" },
];

export default function OperateLayout({ children }: { children: ReactNode }) {
  return <OperationalSectionLayout section="Plan & Operate" href="/operate" description="Turn monitored state into forecasts, flexibility and bounded dispatch intent through explicit constraints, simulation, policy and approval." items={items}>{children}</OperationalSectionLayout>;
}
