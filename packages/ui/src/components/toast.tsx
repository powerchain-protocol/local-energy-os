"use client";

import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-400/35 bg-emerald-950 text-emerald-50",
  error: "border-rose-400/35 bg-rose-950 text-rose-50",
  warning: "border-amber-400/40 bg-amber-950 text-amber-50",
  info: "border-cyan-400/35 bg-slate-950 text-slate-50",
};

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);
  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current.slice(-3), { tone: "info", duration: 4500, ...input, id }]);
    window.setTimeout(() => dismiss(id), input.duration ?? 4500);
    return id;
  }, [dismiss]);
  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[24rem]"
      >
        {items.map((item) => {
          const tone = item.tone ?? "info";
          const Icon = icons[tone];
          return (
            <div
              key={item.id}
              role={tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto grid w-full grid-cols-[auto_1fr_auto] gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-slate-950/25",
                toneStyles[tone],
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-sm leading-5 opacity-80">{item.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Dismiss notification"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </section>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
