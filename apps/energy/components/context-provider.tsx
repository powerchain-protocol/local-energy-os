"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import { energyContextStore, type EnergyWorkspaceContextState } from "@powerchain/store";

const C = createContext<{ context: EnergyWorkspaceContextState; setContext: (state: EnergyWorkspaceContextState) => void } | null>(null);

export function EnergyContextProvider({ children }: { children: React.ReactNode }) {
  const context = useSyncExternalStore(energyContextStore.subscribe, energyContextStore.getSnapshot, energyContextStore.getSnapshot);
  return <C.Provider value={{ context, setContext: energyContextStore.set }}>{children}</C.Provider>;
}

export function useEnergyContext() {
  const value = useContext(C);
  if (!value) throw new Error("EnergyContextProvider missing");
  return value;
}
