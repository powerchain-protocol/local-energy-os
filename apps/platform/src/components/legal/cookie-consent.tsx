"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
const KEY = "powerchain-cookie-consent";
export function CookieConsent() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>setVisible(!localStorage.getItem(KEY)),[]);
  if(!visible) return null;
  const decide=(value:"essential"|"all")=>{localStorage.setItem(KEY,value);setVisible(false)};
  return <section role="dialog" aria-label="Cookie preferences" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex-1"><h2 className="font-bold">Your privacy choices</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">PowerChain uses essential cookies for security and optional analytics cookies to improve the platform. Read our <Link className="underline" href="/legal/cookies">cookie policy</Link>.</p></div><div className="flex gap-2"><button onClick={()=>decide("essential")} className="pc-focus rounded-xl border px-4 py-2 text-sm font-semibold">Essential only</button><button onClick={()=>decide("all")} className="pc-focus rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">Accept all</button></div></div>
  </section>;
}
