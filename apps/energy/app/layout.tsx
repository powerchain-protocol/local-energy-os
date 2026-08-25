import "@powerchain/ui/styles.css";
import "./globals.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";
import { EnergyContextProvider } from "../components/context-provider";
import { ContextSwitcher } from "../components/context-switcher";

export const metadata = { title: "PowerChain Local Energy OS", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "WORKSPACE", items: [
    { label: "Overview", href: "/", icon: "overview" },
    { label: "Energy", href: "/energy", icon: "energy" },
    { label: "Assets", href: "/assets", icon: "assets" },
    { label: "Devices", href: "/devices", icon: "devices" }
  ]},
  { label: "INTELLIGENCE", items: [
    { label: "Copilot", icon: "copilot", disabled: true },
    { label: "Agents", icon: "agents", disabled: true },
    { label: "Automations", icon: "status", disabled: true }
  ]},
  { label: "ECONOMY", items: [
    { label: "Marketplace", icon: "market", disabled: true },
    { label: "Commerce", icon: "commerce", disabled: true },
    { label: "Treasury", icon: "treasury", disabled: true }
  ]},
  { label: "SYSTEM", items: [
    { label: "Organization", icon: "organization", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const workspace = nav[0]!.items;
  return <html lang="en"><body><EnergyContextProvider><ApplicationShell
    product="Local Energy"
    nav={nav}
    mobileNav={{ home: workspace[0], energy: workspace[1], assets: workspace[2] }}
    topAction={<ContextSwitcher/>}
  >{children}</ApplicationShell></EnergyContextProvider></body></html>;
}
