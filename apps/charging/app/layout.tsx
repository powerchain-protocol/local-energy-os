import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain EV Charging", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Charging Overview", href: "/", icon: "charging", active: true },
    { label: "Stations", icon: "devices", disabled: true },
    { label: "Sessions", icon: "energy", disabled: true }
  ]},
  { label: "ECONOMY", items: [
    { label: "Smart Charging", icon: "market", disabled: true },
    { label: "Settlement", icon: "treasury", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Protocols", icon: "status", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="PowerCharge" nav={nav}>{children}</ApplicationShell></body></html>;
}
