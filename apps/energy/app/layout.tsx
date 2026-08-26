import "@powerchain/ui/styles.css";
import "./globals.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";
import { EnergyContextProvider } from "../components/context-provider";
import { ContextSwitcher } from "../components/context-switcher";

export const metadata = { title: "PowerChain Energy Management System", description: "PowerChain Local Energy OS · EMS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "COMMAND", items: [
    { label: "Command Center", href: "/", icon: "overview" },
  ]},
  { label: "ENERGY MANAGEMENT", items: [
    { label: "Overview", href: "/energy", icon: "energy" },
    { label: "Live Flow", href: "/energy/live-flow", icon: "flow" },
    { label: "Generation", href: "/energy/generation", icon: "generation" },
    { label: "Consumption", href: "/energy/consumption", icon: "consumption" },
    { label: "Storage", href: "/energy/storage", icon: "storage" },
    { label: "Forecast", href: "/energy/forecast", icon: "forecast" },
    { label: "Flexibility", href: "/energy/flexibility", icon: "flexibility" },
    { label: "Dispatch", href: "/energy/dispatch", icon: "dispatch" },
    { label: "Grid", href: "/energy/grid", icon: "grid" },
    { label: "Markets", href: "/energy/markets", icon: "market" },
    { label: "Events", href: "/energy/events", icon: "events" },
  ]},
  { label: "ASSETS & EVIDENCE", items: [
    { label: "Energy RWA", href: "/assets", icon: "assets" },
    { label: "Devices", href: "/devices", icon: "devices" },
  ]},
  { label: "INTELLIGENCE", items: [
    { label: "Copilot", icon: "copilot", disabled: true },
    { label: "Agents", icon: "agents", disabled: true },
    { label: "Automations", icon: "status", disabled: true },
  ]},
  { label: "SYSTEM", items: [
    { label: "Organization", icon: "organization", disabled: true },
    { label: "Settings", icon: "settings", disabled: true },
  ]},
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const command = nav[0]!.items[0];
  const emsOverview = nav[1]!.items[0];
  const rwa = nav[2]!.items[0];
  return <html lang="en"><body><EnergyContextProvider><ApplicationShell
    product="Energy"
    nav={nav}
    mobileNav={{ home: command, energy: emsOverview, assets: rwa }}
    topAction={<ContextSwitcher/>}
  >{children}</ApplicationShell></EnergyContextProvider></body></html>;
}
