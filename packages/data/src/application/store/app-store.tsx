"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PlatformStore = {
  commandPaletteOpen: boolean;
  selectedWorkspace: string;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedWorkspace: (workspace: string) => void;
  reset: () => void;
};

const PlatformStoreContext = createContext<PlatformStore | null>(null);

export function PlatformStoreProvider({ children }: { children: ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("operations");

  const reset = useCallback(() => {
    setCommandPaletteOpen(false);
    setSelectedWorkspace("operations");
  }, []);

  const value = useMemo<PlatformStore>(
    () => ({
      commandPaletteOpen,
      selectedWorkspace,
      setCommandPaletteOpen,
      setSelectedWorkspace,
      reset,
    }),
    [commandPaletteOpen, selectedWorkspace, reset],
  );

  return <PlatformStoreContext.Provider value={value}>{children}</PlatformStoreContext.Provider>;
}

export function usePlatformStore(): PlatformStore {
  const context = useContext(PlatformStoreContext);
  if (!context) throw new Error("usePlatformStore must be used inside PlatformStoreProvider");
  return context;
}
