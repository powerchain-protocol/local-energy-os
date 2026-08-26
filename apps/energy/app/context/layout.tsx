import type { ReactNode } from "react";
import { OperationalSectionLayout } from "../../components/operational-section-layout";

const items = [
  { label: "Markets", href: "/context/markets", icon: "market" as const, description: "Prices, reservations and commitments" },
  { label: "Events", href: "/context/events", icon: "events" as const, description: "Operational event evidence" },
];

export default function ContextLayout({ children }: { children: ReactNode }) {
  return <OperationalSectionLayout section="Context" href="/context" description="Add market, event and external-system context without allowing contextual data to override authoritative physical state." items={items}>{children}</OperationalSectionLayout>;
}
