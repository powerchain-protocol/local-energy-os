"use client";
import { useEffect,useState } from "react";import type{SavedPrompt}from"@/types/prompts";
const KEY="powerchain.saved-prompts";
export function SavedPrompts({onUse}:{onUse:(prompt:string)=>void}){const[items,setItems]=useState<SavedPrompt[]>([]);useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem(KEY)??"[]"))}catch{setItems([])}},[]);return <section><h2 className="text-sm font-bold">Saved prompts</h2>{items.length===0?<p className="mt-2 text-sm muted">No saved prompts yet.</p>:<div className="mt-2 space-y-2">{items.map(p=><button key={p.id} onClick={()=>onUse(p.prompt)} className="block w-full rounded-xl border border-[var(--border)] p-3 text-left text-sm">{p.title}</button>)}</div>}</section>}
