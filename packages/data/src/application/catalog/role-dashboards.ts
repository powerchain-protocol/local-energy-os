import type { UserRole } from "@/constants/roles";

export type RoleDashboard = {
  title: string;
  subtitle: string;
  primaryAction: string;
  quickActions: readonly string[];
};

export const roleDashboards: Record<UserRole, RoleDashboard> = {
  consumer: {
    title: "Consumer energy dashboard",
    subtitle: "Track clean-energy consumption, costs, and carbon impact.",
    primaryAction: "Buy local energy",
    quickActions: ["Buy local energy", "View usage"],
  },
  prosumer: {
    title: "Prosumer operations",
    subtitle: "Optimize generation, storage, exports, and marketplace revenue.",
    primaryAction: "List surplus energy",
    quickActions: ["List surplus energy", "Optimize battery"],
  },
  client: {
    title: "P2P energy client",
    subtitle: "Manage local energy contracts and peer-to-peer settlements.",
    primaryAction: "Explore local market",
    quickActions: ["Explore local market", "View settlements"],
  },
  company: {
    title: "Enterprise energy operations",
    subtitle: "Control sites, assets, procurement, ESG, and treasury.",
    primaryAction: "Open operations center",
    quickActions: ["Open operations center", "Review portfolio"],
  },
  admin: {
    title: "Platform administration",
    subtitle: "Manage users, organizations, integrations, and policies.",
    primaryAction: "Manage users",
    quickActions: ["Manage users", "Review policies"],
  },
  "super-admin": {
    title: "Global platform control",
    subtitle: "Operate tenants, networks, standards, and platform services.",
    primaryAction: "Open system console",
    quickActions: ["Open system console", "Platform health"],
  },
};
