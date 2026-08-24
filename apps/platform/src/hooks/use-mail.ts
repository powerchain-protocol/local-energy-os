"use client";

import { useState } from "react";

export function useMail() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function send(payload: Record<string, unknown>) {
    setIsSending(true); setError(null);
    try {
      const response = await fetch("/api/v1/mail", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Unable to send message");
      return await response.json();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to send message";
      setError(message); throw cause;
    } finally { setIsSending(false); }
  }
  return { send, isSending, error };
}
