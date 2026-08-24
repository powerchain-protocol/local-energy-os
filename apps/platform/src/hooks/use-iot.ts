import { useEffect,useState } from "react";
import type { IoTReading } from "@/lib/iot";
export function useIoT(url="/api/v1/iot") {const [readings,setReadings]=useState<IoTReading[]>([]);const [status,setStatus]=useState<"loading"|"live"|"fallback">("loading");useEffect(()=>{const controller=new AbortController();fetch(url,{signal:controller.signal}).then(r=>r.json()).then(data=>{setReadings(data.readings??[]);setStatus(data.fallback?"fallback":"live")}).catch(()=>setStatus("fallback"));return()=>controller.abort()},[url]);return{readings,status};}
