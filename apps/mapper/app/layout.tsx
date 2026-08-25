import "@powerchain/ui/styles.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Mapper", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Energy Map", href: "/", icon: "map", active: true },
    { label: "Grid Layers", icon: "grid", disabled: true },
    { label: "Infrastructure", icon: "plant", disabled: true }
  ]},
  { label: "ENERGY", items: [
    { label: "Generation", icon: "energy", disabled: true },
    { label: "Charging", icon: "charging", disabled: true },
    { label: "Assets", icon: "assets", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Layer Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="Mapper" nav={nav}>{children}</ApplicationShell></body></html>;
}
