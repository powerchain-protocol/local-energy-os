import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Administration", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "System Overview", href: "/", icon: "admin", active: true },
    { label: "Organizations", icon: "organization", disabled: true },
    { label: "Users & Roles", icon: "agents", disabled: true }
  ]},
  { label: "OPERATIONS", items: [
    { label: "Integrations", icon: "api", disabled: true },
    { label: "Audit", icon: "docs", disabled: true },
    { label: "System Status", href: "/system/status", icon: "status" },
    { label: "Runtime Config", href: "/system/config", icon: "settings" },
    { label: "Management", href: "/system/management", icon: "admin" }
  ]},
  { label: "SYSTEM", items: [
    { label: "Security", icon: "admin", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="Administration" nav={nav}>{children}</ApplicationShell></body></html>;
}
