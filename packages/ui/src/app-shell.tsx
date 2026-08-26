"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { PowerChainBrand, PowerChainMark } from "./brand";
import { CommandPalette } from "./command-palette";
import { PowerChainIcon, type PowerChainIconName } from "./icons";

export type AppNavItem = {
  label: string;
  href?: string;
  icon: PowerChainIconName;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
};

export type AppNavGroup = { label: string; items: AppNavItem[] };
export type MobileNavConfig = {
  home?: AppNavItem;
  energy?: AppNavItem;
  assets?: AppNavItem;
};

function routeMatches(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function firstEnabled(items: AppNavItem[]) {
  return items.find((item) => item.href && !item.disabled);
}

export function ApplicationShell({
  children,
  product,
  nav,
  status = "POWERCHAIN · v1.0.0",
  topAction,
  notificationAction,
  accountAction,
  mobileNav
}: {
  children: ReactNode;
  product: string;
  nav: AppNavGroup[];
  status?: string;
  topAction?: ReactNode;
  notificationAction?: ReactNode;
  accountAction?: ReactNode;
  mobileNav?: MobileNavConfig;
}) {
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    setPathname(window.location.pathname || "/");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.classList.add("pc-nav-open");
    window.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("pc-nav-open"); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommand();
      } else if (!typing && event.key === "/") {
        event.preventDefault();
        openCommand();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCommand]);

  const enabledItems = useMemo(() => nav.flatMap((group) => group.items).filter((item) => item.href && !item.disabled), [nav]);
  const activeItem = useMemo(() => {
    const matches = enabledItems.filter((item) => routeMatches(pathname, item.href));
    return matches.sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
  }, [enabledItems, pathname]);
  const activeLabel = activeItem?.label ?? nav.flatMap((group) => group.items).find((item) => !item.href && item.active)?.label ?? "Overview";

  const homeItem = mobileNav?.home ?? enabledItems.find((item) => item.label.toLowerCase() === "overview") ?? firstEnabled(enabledItems);
  const energyItem = mobileNav?.energy ?? enabledItems.find((item) => item.label.toLowerCase() === "energy") ?? enabledItems[1];
  const assetsItem = mobileNav?.assets ?? enabledItems.find((item) => item.label.toLowerCase() === "assets") ?? enabledItems[2];

  const renderMobileItem = (item: AppNavItem | undefined, fallbackLabel: string, fallbackIcon: PowerChainIconName) => {
    if (!item?.href || item.disabled) {
      return <button type="button" className="pc-mobile-dock-item is-muted" onClick={openCommand} aria-label={`Open ${fallbackLabel} navigation`}><PowerChainIcon name={fallbackIcon}/><span>{fallbackLabel}</span></button>;
    }
    const isActive = item.href === activeItem?.href;
    return <a href={item.href} className={`pc-mobile-dock-item ${isActive ? "is-active" : ""}`} aria-current={isActive ? "page" : undefined}><PowerChainIcon name={item.icon}/><span>{item.label}</span></a>;
  };

  return (
    <div className="pc-app-shell">
      <a className="pc-skip-link" href="#pc-content">Skip to content</a>
      <button className={`pc-sidebar-backdrop ${open ? "is-open" : ""}`} aria-label="Close navigation" onClick={() => setOpen(false)} />
      <aside className={`pc-sidebar ${open ? "is-open" : ""}`} aria-label={`${product} navigation`}>
        <div className="pc-sidebar-head">
          <PowerChainBrand product={product} />
          <button className="pc-sidebar-close" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}><PowerChainIcon name="close" /></button>
        </div>
        <nav className="pc-sidebar-nav">
          {nav.map((group) => (
            <section className="pc-nav-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="pc-nav-list">
                {group.items.map((item) => {
                  const isActive = item.href ? item.href === activeItem?.href : item.active === true;
                  const content = <><PowerChainIcon name={item.icon} /><span>{item.label}</span>{item.badge ? <small>{item.badge}</small> : null}</>;
                  if (item.disabled || !item.href) return <span key={item.label} className="pc-nav-item is-disabled" aria-disabled="true">{content}</span>;
                  return <a key={item.label} className={`pc-nav-item ${isActive ? "is-active" : ""}`} aria-current={isActive ? "page" : undefined} href={item.href} onClick={() => setOpen(false)}>{content}</a>;
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
      <div className="pc-app-stage">
        <header className="pc-topbar">
          <div className="pc-topbar-left">
            <button className="pc-menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><PowerChainIcon name="menu" /></button>
            <div className="pc-breadcrumb" aria-label="Current location"><span>{product}</span><PowerChainIcon name="chevron"/><strong>{activeLabel}</strong></div>
          </div>
          <div className="pc-topbar-actions">
            <button className="pc-search-control" type="button" aria-label="Open PowerChain search" onClick={openCommand}><PowerChainIcon name="search" /><span>Search PowerChain</span><kbd>⌘K</kbd></button>
            {topAction}
            <span className="pc-network-chip"><span className="pc-live-dot" />{status}</span>
            {notificationAction}
            {accountAction}
          </div>
        </header>
        <div id="pc-content" className="pc-app-content" tabIndex={-1}>{children}</div>
      </div>
      <nav className="pc-mobile-dock" aria-label="Mobile application navigation">
        {renderMobileItem(homeItem, "Home", "overview")}
        {renderMobileItem(energyItem, "Energy", "energy")}
        <button type="button" className="pc-mobile-dock-power" aria-label="Open PowerChain command menu" onClick={openCommand}><PowerChainMark/><span>PowerChain</span></button>
        {renderMobileItem(assetsItem, "Assets", "assets")}
        <button type="button" className="pc-mobile-dock-item" aria-label="Open navigation" onClick={() => setOpen(true)}><PowerChainIcon name="menu"/><span>More</span></button>
      </nav>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} nav={nav} product={product} />
    </div>
  );
}
