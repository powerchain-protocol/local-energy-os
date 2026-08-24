"use client";
import { cn } from "../lib/cn";
export function StatusPill({status}:{status:"online"|"warning"|"offline"}){return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",status==="online"&&"bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",status==="warning"&&"bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",status==="offline"&&"bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300")}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{status}</span>}
