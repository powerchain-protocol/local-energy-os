import "@powerchain/ui/styles.css";
import "./globals.css";
import { ApplicationShell, type AppNavGroup } from "@powerchain/ui";

export const metadata = { title: "PowerChain Developer API", description: "PowerChain Local Energy OS v1.0.0" };

const nav: AppNavGroup[] = [
  { label: "DEVELOPER", items: [
    { label: "API Overview", href: "/", icon: "api", active: true },
    { label: "Swagger", href: "/docs", icon: "docs" },
    { label: "OpenAPI", href: "/openapi.yaml", icon: "docs" }
  ]},
  { label: "RESOURCES", items: [
    { label: "Health", href: "/api/v1/health", icon: "status" },
    { label: "System Health", href: "/api/v1/system/health", icon: "status" }
  ]},
  { label: "SYSTEM", items: [
    { label: "Authentication", icon: "admin", disabled: true },
    { label: "Settings", icon: "settings", disabled: true }
  ]}
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ApplicationShell product="Developer API" nav={nav}>{children}</ApplicationShell></body></html>;
}
