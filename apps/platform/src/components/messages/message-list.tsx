"use client";
import type{ChatMessage}from"@/types/ai/chat";import{MessageBubble}from"./message-bubble";
export function MessageList({messages}:{messages:ChatMessage[]}){return <div role="log" aria-live="polite" className="space-y-3">{messages.map(m=><MessageBubble key={m.id} message={m}/>)}</div>}
