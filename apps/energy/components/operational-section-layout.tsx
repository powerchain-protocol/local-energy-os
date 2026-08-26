"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PowerChainIcon, type PowerChainIconName } from "@powerchain/ui";

export type OperationalSectionItem = {
  label: string;
  href: string;
  icon: PowerChainIconName;
  description: string;
};

export function OperationalSectionLayout({
  section,
  href,
  description,
  items,
  children,
}: {
  section: string;
  href: string;
  description: string;
  items: OperationalSectionItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  return <div className="ems-section-shell">
    <section className="ems-section-context" aria-label={`${section} workspace navigation`}>
      <div className="ems-section-context-copy">
        <a href={href} className="ems-section-title"><span>{section}</span><PowerChainIcon name="chevron"/></a>
        <p>{description}</p>
      </div>
      <nav className="ems-section-nav">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <a key={item.href} href={item.href} className={`ems-section-nav-item ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <PowerChainIcon name={item.icon}/>
            <span><strong>{item.label}</strong><small>{item.description}</small></span>
          </a>;
        })}
      </nav>
    </section>
    {children}
  </div>;
}
