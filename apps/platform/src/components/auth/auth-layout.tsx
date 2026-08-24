"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-visual" aria-label="PowerChain renewable energy platform">
          <Image src="/login-reference.jpeg" alt="Renewable energy landscape" fill priority className="auth-visual-image" sizes="(min-width: 1024px) 48vw, 0px" />
          <div className="auth-visual-overlay" />
          <div className="auth-brand-mark">
            <Image src="/logo-white.png" alt="" width={230} height={230} className="auth-brand-logo" priority />
            <h1>PowerChain</h1>
            <div className="auth-brand-rule" />
            <p>Renewable Energy<br />Operating System</p>
          </div>
          <div className="auth-visual-footer">
            <span>Secure operations</span><span>•</span><span>Smart grids</span><span>•</span><span>Energy markets</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-mobile-brand">
              <Image src="/logo-dark.png" alt="PowerChain" width={44} height={44} />
              <strong>PowerChain</strong>
            </div>
            <header className="auth-heading">
              <p className="auth-eyebrow">Renewable Energy OS</p>
              <h2>{title}</h2>
              <p>{description}</p>
            </header>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
