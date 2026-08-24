import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/util";
export function Input({className,...props}:InputHTMLAttributes<HTMLInputElement>){return <input className={cn("h-11 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10",className)} {...props}/>}
