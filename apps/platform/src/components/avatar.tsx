"use client";
import Image from "next/image";
import { cn } from "@/utils/util";
export function Avatar({name="PowerChain User",size="md",coin=false}:{name?:string;size?:"sm"|"md"|"lg";coin?:boolean}){
  const dimensions=size==="sm"?"h-8 w-8":size==="lg"?"h-12 w-12":"h-9 w-9";
  return <span aria-label={name} title={name} className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-emerald-800/15 bg-emerald-950 text-white shadow-sm",dimensions)}>{coin?<Image src="/PWRC.png" alt="PWRC" width={48} height={48} className="h-full w-full object-cover"/>:<span className="text-xs font-semibold">{name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}</span>}</span>
}
