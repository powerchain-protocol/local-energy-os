import Link from "next/link";
import type { ReactNode } from "react";
import { DocsSidebar } from "./sidebar";

export function DocsShell({
  children,
  activeSlug,
}: {
  children: ReactNode;
  activeSlug?: string;
}) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="PowerChain documentation home">
          <img src="/assets/logo-green.png" alt="PowerChain" />
          <span>
            <strong>Local Energy OS</strong>
            <small>Documentation</small>
          </span>
        </Link>

        <nav className="top-nav" aria-label="Primary">
          <Link href="/whitepaper">Whitepaper</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/api">API</Link>
          <span className="version-pill">v1.0.0</span>
        </nav>
      </header>

      <nav className="mobile-doc-nav" aria-label="Mobile documentation navigation">
        <Link href="/whitepaper">Whitepaper</Link>
        <Link href="/architecture">Architecture</Link>
        <Link href="/energy-rwa">Energy RWA</Link>
        <Link href="/pwrc">PWRC</Link>
        <Link href="/api">API</Link>
      </nav>

      <div className="docs-layout">
        <DocsSidebar activeSlug={activeSlug} />
        <main className="docs-main">{children}</main>
      </div>

      <footer className="site-footer">
        <div>
          <strong>PowerChain Local Energy OS</strong>
          <span>Physical energy remains authoritative.</span>
        </div>
        <div className="footer-links">
          <Link href="/security">Security</Link>
          <Link href="/operations">Operations</Link>
          <a href="https://github.com/powerchain-protocol/digital-energy-os" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
