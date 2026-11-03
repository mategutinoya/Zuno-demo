"use client";
import { useSyncExternalStore } from "react";

/** Tiny observable store — avoids an extra state dependency. */
export function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export type Store<T> = ReturnType<typeof createStore<T>>;

export function useStore<T>(store: Store<T>, serverValue?: T): T {
  return useSyncExternalStore(
    store.subscribe,
    store.get,
    () => (serverValue === undefined ? store.get() : serverValue),
  );
}

/** Index of the active flavour in FLAVORS */
export const flavorStore = createStore(0);
/** "unknown" until the age gate checks storage */
export const gateStore = createStore<"unknown" | "pending" | "verified" | "denied">("unknown");
/** Becomes true once the 3D scene has compiled its first frame (or fell back) */
export const sceneReadyStore = createStore(false);
