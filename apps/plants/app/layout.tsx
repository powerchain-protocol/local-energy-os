import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Power Plants", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Plant Overview", href: "/", icon: "plant", active: true },
    { label: "Generation", icon: "energy", disabled: true },
    { label: "Equipment", icon: "devices", disabled: true }
  ]},
  { label: "ECONOMY", items: [
    { label: "Energy RWA", icon: "assets", disabled: true },
    { label: "Settlement", icon: "treasury", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Organization", icon: "organization", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="PowerPlants" nav={nav}>{children}</ApplicationShell></body></html>;
}
