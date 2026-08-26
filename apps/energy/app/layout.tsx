import "@powerchain/ui/styles.css";
import "./globals.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";
import { EnergyContextProvider } from "../components/context-provider";
import { ContextSwitcher } from "../components/context-switcher";

export const metadata = { title: "PowerChain Energy Management System", description: "PowerChain Local Energy OS · EMS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "OVERVIEW", items: [
    { label: "Overview", href: "/", icon: "overview" },
  ]},
  { label: "MONITOR", items: [
    { label: "Monitor", href: "/monitor", icon: "activity" },
    { label: "Live Flow", href: "/monitor/live-flow", icon: "flow" },
    { label: "Generation", href: "/monitor/generation", icon: "generation" },
    { label: "Consumption", href: "/monitor/consumption", icon: "consumption" },
    { label: "Storage", href: "/monitor/storage", icon: "storage" },
  ]},
  { label: "PLAN & OPERATE", items: [
    { label: "Plan & Operate", href: "/operate", icon: "dispatch" },
    { label: "Forecast", href: "/operate/forecast", icon: "forecast" },
    { label: "Flexibility", href: "/operate/flexibility", icon: "flexibility" },
    { label: "Dispatch", href: "/operate/dispatch", icon: "dispatch" },
    { label: "Grid", href: "/operate/grid", icon: "grid" },
  ]},
  { label: "CONTEXT", items: [
    { label: "Context", href: "/context", icon: "events" },
    { label: "Markets", href: "/context/markets", icon: "market" },
    { label: "Events", href: "/context/events", icon: "events" },
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
  const overview = nav[0]!.items[0];
  const monitor = nav[1]!.items[0];
  const rwa = nav[4]!.items[0];
  return <html lang="en"><body><EnergyContextProvider><ApplicationShell
    product="Energy"
    nav={nav}
    mobileNav={{ home: overview, energy: monitor, assets: rwa }}
    topAction={<ContextSwitcher/>}
  >{children}</ApplicationShell></EnergyContextProvider></body></html>;
}
