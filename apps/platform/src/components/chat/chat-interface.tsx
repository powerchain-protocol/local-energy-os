"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Gauge, Link as LinkIcon, Upload } from "lucide-react";
import Link from "next/link";
import type { ChatMessage } from "@/types/ai/chat";
import { MessageList } from "@/components/messages/message-list";
import { AiSettingsDrawer } from "@/components/ai/settings-drawer";
import { AiConfigurationBar } from "@/components/ai/configuration-bar";
import { Button } from "@/components/ui/button";
import { Suggestions } from "./suggestions";
import { PromptsLibrary } from "./prompts-library";

const MAX = 2000;
const allowed = /energy|renewable|solar|wind|hydro|battery|grid|meter|iot|depin|carbon|token|pwrc|crt|rec|market|price|treasury|asset|ev|charging|forecast|maintenance|settlement/i;

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const chars = input.length;
  const valid = useMemo(() => !input.trim() || allowed.test(input), [input]);

  function attachLink() {
    const url = window.prompt("Paste a link to energy or operational context");
    if (url?.trim()) setInput((value) => `${value}${value ? "\n" : ""}${url.trim()}`);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || busy || content.length > MAX || !allowed.test(content)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chatId, userId: "demo-user", message: content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Chat failed");
      setChatId(payload.data.chatId);
      setMessages(payload.data.messages);
      setInput("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "PowerChain Copilot is temporarily unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel flex min-h-[min(760px,calc(100dvh-12rem))] min-w-0 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-emerald-900 text-white shadow-[0_8px_20px_rgba(6,78,59,.18)]"><Bot className="h-5 w-5" /></span>
            <div className="min-w-0"><h2 className="truncate font-semibold">PowerChain Copilot</h2><p className="truncate text-xs text-[var(--muted)]">GRIDLLM · renewable intelligence</p></div>
          </div>
          <AiSettingsDrawer />
        </header>

        <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5"><AiConfigurationBar /></div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          <MessageList messages={messages} />
          {messages.length === 0 && (
            <div className="mx-auto flex min-h-[390px] max-w-2xl flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-gradient-to-br from-emerald-950 to-emerald-800 text-white shadow-[0_18px_42px_rgba(6,78,59,.22)]"><Gauge className="h-7 w-7" /></div>
              <h2 className="mt-5 text-2xl font-semibold text-balance">Energy intelligence for PowerChain</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)] text-pretty">Analyze renewable operations, tokenomics, token data, prices, smart-grid conditions and energy-market decisions.</p>
              <div className="mt-6 w-full"><Suggestions onSelect={setInput} /></div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_97%,var(--bg))] p-3 sm:p-4">
          {error && <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error}</div>}
          <label className="sr-only" htmlFor="chat-message">Message</label>
          <textarea id="chat-message" maxLength={MAX} value={input} onChange={(event) => setInput(event.target.value)} rows={3} className="min-h-20 w-full resize-none rounded-[15px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-inner outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" placeholder="Ask about renewables, grid operations, tokenomics or energy prices…" />
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-1.5">
              <input ref={fileInput} type="file" accept=".csv,.json,.txt" className="sr-only" onChange={(event)=>{const file=event.target.files?.[0];if(file)setInput((value)=>`${value}${value?"\n":""}Analyze uploaded operational file: ${file.name}`);}} />
              <button type="button" onClick={()=>fileInput.current?.click()} className="icon-button h-9 w-9" aria-label="Upload operational data"><Upload className="h-4 w-4" /></button>
              <button type="button" onClick={attachLink} className="icon-button h-9 w-9" aria-label="Attach link"><LinkIcon className="h-4 w-4" /></button>
              <span className={valid ? "truncate text-xs text-[var(--muted)]" : "truncate text-xs text-red-600"}>{valid ? "PowerChain use cases only" : "Ask about PowerChain energy, markets or tokens"}</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs tabular-nums text-[var(--muted)]">{chars} / {MAX}</span>
              <Button type="submit" size="md" loading={busy} loadingLabel="Analyzing…" disabled={!input.trim() || !valid}>Send</Button>
            </div>
          </div>
        </form>
      </section>

      <aside className="grid min-w-0 gap-4 md:grid-cols-2 2xl:block 2xl:space-y-5">
        <PromptsLibrary onUse={setInput} />
        <div className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Model configuration</p>
          <dl className="mt-3 space-y-2.5 text-sm"><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Model</dt><dd className="font-semibold">GridLLM Energy</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Adapter</dt><dd className="font-semibold">Renewables LoRA</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Memory</dt><dd className="font-semibold">Workspace</dd></div></dl>
          <Link href="/settings/integrations" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline">Configure AI models</Link>
        </div>
        <div className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Conversation</p>
          <p className="mt-2 break-all text-sm text-[var(--muted)]">{chatId ?? "Created on first message"}</p>
        </div>
      </aside>
    </div>
  );
}
