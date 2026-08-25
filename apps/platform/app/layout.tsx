import "@powerchain/ui/styles.css";
import "./globals.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain SaaS Platform", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Overview", href: "/", icon: "overview", active: true },
    { label: "Applications", icon: "assets", disabled: true },
    { label: "Organizations", icon: "organization", disabled: true }
  ]},
  { label: "ECONOMY", items: [
    { label: "Plans & Billing", icon: "treasury", disabled: true },
    { label: "Entitlements", icon: "status", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Administration", icon: "admin", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="Platform" nav={nav}>{children}</ApplicationShell></body></html>;
}
