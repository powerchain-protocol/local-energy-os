"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getPowerChainInsight, type AIMessage } from "@/types/ai/ai";

type AIContextValue = {
  messages: AIMessage[];
  pending: boolean;
  send: (content: string) => Promise<void>;
  clear: () => void;
};

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [pending, setPending] = useState(false);
  const send = useCallback(async (content: string) => {
    const user: AIMessage = { role: "user", content };
    setMessages((current) => [...current, user]);
    setPending(true);
    const result = await getPowerChainInsight([...messages, user]);
    if (result.data) setMessages((current) => [...current, result.data!]);
    setPending(false);
  }, [messages]);
  const clear = useCallback(() => setMessages([]), []);
  const value = useMemo(() => ({ messages, pending, send, clear }), [messages, pending, send, clear]);
  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const value = useContext(AIContext);
  if (!value) throw new Error("useAI must be used inside AIProvider");
  return value;
}
