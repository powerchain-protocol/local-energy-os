import type { Metadata } from "next";
import "@powerchain/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PowerChain Docs", template: "%s · PowerChain Docs" },
  description: "PowerChain Local Energy OS v1.0.0 canonical documentation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
