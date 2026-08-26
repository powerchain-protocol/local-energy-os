import "@powerchain/ui/styles.css";
import "./globals.css";

export const metadata = {
  title: "PowerChain Platform",
  description: "PowerChain Local Energy OS v1.0.0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
