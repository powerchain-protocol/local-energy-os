"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRightIcon, ExitIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { NAVIGATION_GROUPS } from "@/constants/navigation";
import { useAuth } from "@/context/auth-context";
import { useApp } from "@/context/app-context";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { ROUTES } from "@/config/routes";
import { Logo } from "./logo";
import { cn } from "@/utils/util";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { mobileSidebarOpen, setMobileSidebarOpen, sidebarCollapsed } = useApp();
  const { status, latencyMs } = useNetworkStatus();
  const [signingOut, setSigningOut] = useState(false);
  const role = session?.user.role ?? "consumer";

  const visibleGroups = useMemo(
    () => NAVIGATION_GROUPS
      .map((group) => ({ ...group, items: group.items.filter((item) => !item.roles || item.roles.includes(role)) }))
      .filter((group) => group.items.length > 0),
    [role],
  );

  async function logout() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace(ROUTES.signin);
      router.refresh();
    } finally {
      setSigningOut(false);
      setMobileSidebarOpen(false);
    }
  }

  return (
    <>
      <button
        aria-label="Close navigation"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn("fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden", mobileSidebarOpen ? "block" : "hidden")}
      />
      <aside
        className={cn(
          "app-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width,transform] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-[5.25rem]" : "w-[18rem] lg:w-[17.5rem]",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-[var(--border)]", sidebarCollapsed ? "justify-center px-3" : "px-5")}>
          <Logo compact={sidebarCollapsed} />
        </div>

        <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => (
            <section key={group.label} className="mb-5">
              <h2 className={cn("px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[var(--muted)]", sidebarCollapsed && "sr-only")}>
                {group.label}
              </h2>
              <div className="space-y-1">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      title={sidebarCollapsed ? label : undefined}
                      className={cn(
                        "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-150",
                        active
                          ? "bg-emerald-700/[.10] text-emerald-900 shadow-[0_8px_22px_rgba(6,78,59,.08)] before:absolute before:-left-1 before:h-5 before:w-1 before:rounded-full before:bg-emerald-600 dark:text-emerald-200"
                          : "text-[var(--muted)] hover:translate-x-0.5 hover:bg-emerald-950/[.045] hover:text-[var(--text)] dark:hover:bg-white/[.05]",
                        sidebarCollapsed && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className={cn("min-w-0 flex-1 truncate", sidebarCollapsed && "sr-only")}>{label}</span>
                      <ChevronRightIcon className={cn("h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50", active && "opacity-70", sidebarCollapsed && "hidden")} />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          {!sidebarCollapsed && (
            <div className="mb-2 rounded-xl border border-emerald-700/15 bg-emerald-950/[.035] px-3 py-2.5 text-xs dark:bg-emerald-300/[.035]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold capitalize text-emerald-700 dark:text-emerald-400">
                  <span className={cn("h-2 w-2 rounded-full", status === "online" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500")} />
                  {status === "connecting" ? "Connecting" : `${status} systems`}
                </span>
                {latencyMs !== null && <span className="text-[10px] text-[var(--muted)]">{latencyMs} ms</span>}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            title={sidebarCollapsed ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-red-500/[.07] hover:text-red-700 disabled:opacity-60 dark:hover:text-red-300",
              sidebarCollapsed && "justify-center px-0",
            )}
          >
            <ExitIcon className="h-4 w-4" />
            <span className={sidebarCollapsed ? "sr-only" : ""}>{signingOut ? "Signing out…" : "Log out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
