import type { ReactNode } from "react";
import Link from "next/link";
import { PowerChainBrand, PowerChainIcon, StatusBadge } from "@powerchain/ui";

export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return <main className="pc-auth-page">
    <section className="pc-auth-trust" aria-label="PowerChain authentication trust boundary">
      <div className="pc-auth-trust-brand"><PowerChainBrand product="Platform"/></div>
      <div className="pc-auth-trust-copy">
        <p className="pc-eyebrow">IDENTITY & ACCESS</p>
        <h1>Infrastructure-grade access without hiding the trust boundary.</h1>
        <p>Account authentication, wallet ownership, organization membership and transaction authorization remain separate controls.</p>
      </div>
      <div className="pc-auth-trust-list">
        <div><span><PowerChainIcon name="shield"/></span><div><strong>Bounded session</strong><p>Authentication creates a session. It never authorizes an energy dispatch or blockchain transaction by itself.</p></div></div>
        <div><span><PowerChainIcon name="wallet"/></span><div><strong>Wallet ownership is separate</strong><p>A wallet signature proves control of an address; organization roles and permissions still resolve independently.</p></div></div>
        <div><span><PowerChainIcon name="activity"/></span><div><strong>Audit-visible state</strong><p>Expired, suspended, verification-required and unavailable states are surfaced explicitly instead of collapsed into a generic login error.</p></div></div>
      </div>
      <div className="pc-auth-trust-footer"><StatusBadge tone="success">TLS / HttpOnly session</StatusBadge><span>PowerChain v1.0.0</span></div>
    </section>
    <section className="pc-auth-main">
      <div className="pc-auth-mobile-brand"><Link href="/" aria-label="PowerChain Platform"><PowerChainBrand product="Platform"/></Link></div>
      <div className="pc-auth-card">
        <header className="pc-auth-card-head"><p className="pc-eyebrow">POWERCHAIN ACCOUNT</p><h2>{title}</h2><p>{description}</p></header>
        {children}
        {footer ? <div className="pc-auth-card-footer">{footer}</div> : null}
      </div>
      <p className="pc-auth-legal">By continuing, you are accessing PowerChain infrastructure under your organization&apos;s security and acceptable-use policies.</p>
    </section>
  </main>;
}
