import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.powerchain.ventures"),
  title: {
    default: "PowerChain Local Energy OS Documentation",
    template: "%s | PowerChain Local Energy OS",
  },
  description:
    "Canonical PowerChain Local Energy OS documentation for smart metering, Energy RWA, local markets, Solana, Sui and machine-economy infrastructure.",
  applicationName: "PowerChain Docs",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "PowerChain Local Energy OS",
    description:
      "Physical energy infrastructure, verified Energy RWA, multi-chain settlement and machine economy.",
    siteName: "PowerChain Documentation",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
