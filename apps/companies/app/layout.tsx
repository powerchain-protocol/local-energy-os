import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Companies", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Company Overview", href: "/", icon: "organization", active: true },
    { label: "Sites", icon: "plant", disabled: true },
    { label: "Customers", icon: "agents", disabled: true },
    { label: "Devices", icon: "devices", disabled: true }
  ]},
  { label: "ECONOMY", items: [
    { label: "Energy Market", icon: "market", disabled: true },
    { label: "Energy RWA", icon: "assets", disabled: true },
    { label: "Settlement", icon: "treasury", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Members & Roles", icon: "agents", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ApplicationShell product="Companies" nav={nav}>{children}</ApplicationShell></body></html>;
}
