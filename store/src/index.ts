import type { EnergyContextType } from "@powerchain/contracts";

export type StoreListener = () => void;

export interface Store<T> {
  getSnapshot(): T;
  set(next: T): void;
  update(updater: (current: T) => T): void;
  subscribe(listener: StoreListener): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<StoreListener>();
  return {
    getSnapshot: () => state,
    set(next) {
      if (Object.is(state, next)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    update(updater) {
      this.set(updater(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export interface EnergyWorkspaceContextState {
  type: EnergyContextType;
  label: string;
}

export const energyContextStore = createStore<EnergyWorkspaceContextState>({
  type: "COMMUNITY",
  label: "Helsinki North"
});
