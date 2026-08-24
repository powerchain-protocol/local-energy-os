"use client";
import { Sparkles } from "lucide-react";
import { useApp } from "@/context/app-context";

export function OpenCopilotButton({className="primary"}:{className?:string}){
  const{setCopilotOpen}=useApp();
  return <button type="button" className={className} onClick={()=>setCopilotOpen(true)}><Sparkles className="h-4 w-4"/>Open Copilot</button>;
}
