"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const SIDEBAR_KEY = "powerchain:sidebar-collapsed";

type AppContextValue = {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandOpen: boolean;
  setCommandOpen: (value: boolean) => void;
  copilotOpen: boolean;
  setCopilotOpen: (value: boolean) => void;
  activeOrganizationId: string;
  setActiveOrganizationId: (value: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState("org_powerchain_demo");

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        setCopilotOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
        setCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      mobileSidebarOpen,
      setMobileSidebarOpen,
      sidebarCollapsed,
      toggleSidebar,
      commandOpen,
      setCommandOpen,
      copilotOpen,
      setCopilotOpen,
      activeOrganizationId,
      setActiveOrganizationId,
    }),
    [mobileSidebarOpen, sidebarCollapsed, toggleSidebar, commandOpen, copilotOpen, activeOrganizationId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
