"use client";
import { useEffect, useState } from "react";
export function useRealtimeTelemetry() { const [latest,setLatest]=useState<unknown>(null); const [status,setStatus]=useState("connecting"); useEffect(()=>{if(typeof EventSource==="undefined"){setStatus("fallback");return;}const source=new EventSource("/api/v1/telemetry");source.onopen=()=>setStatus("open");source.onmessage=e=>{try{setLatest(JSON.parse(e.data));}catch{setLatest(e.data)}};source.onerror=()=>setStatus("fallback");return()=>source.close();},[]);return{latest,status}; }
