import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain PowerGrid", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Grid Overview", href: "/", icon: "grid", active: true },
    { label: "Topology", icon: "map", disabled: true },
    { label: "Constraints", icon: "status", disabled: true }
  ]},
  { label: "OPERATIONS", items: [
    { label: "Flexibility", icon: "energy", disabled: true },
    { label: "Dispatch", icon: "market", disabled: true },
    { label: "Events", icon: "status", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Organization", icon: "organization", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="PowerGrid" nav={nav}>{children}</ApplicationShell></body></html>;
}
