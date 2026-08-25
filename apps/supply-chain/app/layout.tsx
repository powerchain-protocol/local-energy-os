import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Supply Chain", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Overview", href: "/", icon: "supply", active: true },
    { label: "Asset Passports", icon: "assets", disabled: true },
    { label: "Events", icon: "status", disabled: true }
  ]},
  { label: "INFRASTRUCTURE", items: [
    { label: "Manufacturers", icon: "plant", disabled: true },
    { label: "Devices", icon: "devices", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Organization", icon: "organization", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="Supply Chain" nav={nav}>{children}</ApplicationShell></body></html>;
}
