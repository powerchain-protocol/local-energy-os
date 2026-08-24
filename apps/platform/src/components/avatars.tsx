"use client";
import Image from "next/image";
export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) { const initials = name.split(/\s+/).map((v)=>v[0]).join("").slice(0,2).toUpperCase(); return <span className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-100 font-semibold text-emerald-900" style={{ width:size, height:size }}>{src ? <Image src={src} alt="" width={size} height={size} className="h-full w-full object-cover"/> : initials}</span>; }
