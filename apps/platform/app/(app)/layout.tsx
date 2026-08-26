import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Overview", href: "/", icon: "overview" },
    { label: "Applications", icon: "assets", disabled: true },
    { label: "Organizations", icon: "organization", disabled: true },
  ]},
  { label: "ECONOMY", items: [
    { label: "Plans & Billing", icon: "treasury", disabled: true },
    { label: "Entitlements", icon: "status", disabled: true },
  ]},
  { label: "SYSTEM", items: [
    { label: "Administration", icon: "admin", disabled: true },
    { label: "Settings", icon: "settings", disabled: true },
  ]},
];

export default function PlatformLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ApplicationShell product="Platform" nav={nav}>{children}</ApplicationShell>;
}
