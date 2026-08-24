"use client";
import type { ChatMessage } from "@/types/ai/chat";
export function MessageBubble({message}:{message:ChatMessage}){const mine=message.role==="user";return <article className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mine?"ml-auto bg-emerald-800 text-white":"bg-[var(--surface)] border border-[var(--border)]"}`}><p className="whitespace-pre-wrap">{message.content}</p><time className="mt-2 block text-[10px] opacity-70">{new Date(message.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></article>}
