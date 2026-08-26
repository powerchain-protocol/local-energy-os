"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SafeActionResult } from "@powerchain/safe-actions";

export type AsyncState<T> = { status: "idle" | "loading" | "success" | "error"; data?: T; error?: Error };

export function useAsyncResource<T>(loader: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((current: AsyncState<T>) => ({ ...current, status: "loading", error: undefined }));
    try { const data = await loader(controller.signal); if (!controller.signal.aborted) setState({ status: "success", data }); }
    catch (error) { if (!controller.signal.aborted) setState({ status: "error", error: error instanceof Error ? error : new Error("Request failed") }); }
  // Caller-supplied deps intentionally define loader identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { void load(); return () => controllerRef.current?.abort(); }, [load]);
  return { ...state, reload: load };
}

export function useSafeAction<TInput, TOutput>(action: (input: TInput) => Promise<SafeActionResult<TOutput>>) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SafeActionResult<TOutput> | undefined>();
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const execute = useCallback(async (input: TInput) => {
    setPending(true);
    try { const next = await action(input); if (mounted.current) setResult(next); return next; }
    finally { if (mounted.current) setPending(false); }
  }, [action]);
  return { execute, pending, result, reset: () => setResult(undefined) };
}
