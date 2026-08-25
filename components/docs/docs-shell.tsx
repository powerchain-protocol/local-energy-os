import type { ReactNode } from "react";
import Link from "next/link";
import { DOCS_NAVIGATION } from "@powerchain/shared";
import { PowerChainBrand } from "@powerchain/ui";

export function DocsShell({ children, currentSlug }: { children: ReactNode; currentSlug?: string }) {
  return (
    <div className="docs-shell">
      <a className="skip-link" href="#docs-main">Skip to documentation</a>
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <Link className="docs-brand" href="/">
          <PowerChainBrand product="Documentation" />
        </Link>
        <nav>
          {DOCS_NAVIGATION.map((group) => (
            <section className="docs-nav-group" key={group.group}>
              <h2>{group.group}</h2>
              {group.items.map((item) => (
                <Link key={item.slug} href={`/${item.slug}`} aria-current={currentSlug === item.slug ? "page" : undefined}>
                  {item.label}
                </Link>
              ))}
            </section>
          ))}
        </nav>
      </aside>
      <div className="docs-stage">
        <header className="docs-topbar">
          <div><span className="status-dot" /> Canonical documentation</div>
          <div className="docs-topbar-links"><Link href="/api">API</Link><Link href="/energy-rwa">Energy RWA</Link></div>
        </header>
        <main id="docs-main" className="docs-main" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
