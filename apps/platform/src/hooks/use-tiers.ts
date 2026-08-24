import { useEffect, useState } from "react";
import type { Tier } from "@/data/tiers";
export function useTiers(){const[data,setData]=useState<Tier[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);useEffect(()=>{fetch("/api/v1/tiers").then(async r=>{if(!r.ok)throw new Error("Unable to load tiers");return r.json()}).then(p=>setData(p.data)).catch(e=>setError(e instanceof Error?e.message:"Unable to load tiers")).finally(()=>setLoading(false))},[]);return{tiers:data,loading,error};}
