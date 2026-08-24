"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileSearch,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { contextSuggestions, type CopilotContextRef, type CopilotContextType, type CopilotMode } from "@powerchain/copilot";
import { useApp } from "@/context/app-context";

type RunResult = {
  plan:{
    id:string;
    mode:CopilotMode;
    contexts:CopilotContextRef[];
    steps:Array<{id:string;agentName:string;purpose:string;skills:string[];status:"PLANNED"|"RUNNING"|"COMPLETED"|"BLOCKED"}>;
    requiresHumanApproval:boolean;
    requiresWalletSignature:boolean;
  };
  answer:string;
  provider:string;
  modelId:string;
  executionMode:"provider"|"safe-fallback";
  action:null|{
    id:string;
    title:string;
    description:string;
    state:string;
    risk:string;
    requiresWalletSignature:boolean;
  };
  approvalBoundary:{humanApprovalRequired:boolean;walletSignatureRequired:boolean;agentCanSign:false};
};

const MODES: Array<{id:CopilotMode;label:string;detail:string}> = [
  {id:"ASK",label:"Ask",detail:"Answer"},
  {id:"ANALYZE",label:"Analyze",detail:"Evidence + insight"},
  {id:"RESEARCH",label:"Research",detail:"Sources + findings"},
  {id:"ACT",label:"Act",detail:"Draft for approval"},
];

const ADD_CONTEXT: Array<{type:CopilotContextType;label:string}> = [
  {type:"ASSET",label:"Asset"},
  {type:"PROJECT",label:"Project"},
  {type:"PORTFOLIO",label:"Portfolio"},
  {type:"FUNDING_ROUND",label:"FundingRound"},
  {type:"TREASURY",label:"Treasury"},
  {type:"DOCUMENT",label:"Document"},
  {type:"TRANSACTION",label:"Transaction"},
  {type:"REPORT",label:"Report"},
];

function routeContext(pathname:string):CopilotContextRef{
  const segment=pathname.split("/").filter(Boolean);
  if(pathname.startsWith("/projects/")&&segment[1])return{type:"PROJECT",id:segment[1],label:segment[1],source:"ROUTE"};
  if(pathname.startsWith("/digital-twins/")&&segment[1])return{type:"DIGITAL_TWIN",id:segment[1],label:segment[1],source:"ROUTE"};
  if(pathname.startsWith("/energy-rwa"))return{type:"ENERGY_RWA",id:"energy-rwa",label:"Energy RWA",source:"ROUTE"};
  if(pathname.startsWith("/local-energy"))return{type:"LOCAL_ENERGY",id:"local-energy",label:"Local Energy OS",source:"ROUTE"};
  if(pathname.startsWith("/portfolio"))return{type:"PORTFOLIO",id:"portfolio",label:"Portfolio",source:"ROUTE"};
  if(pathname.startsWith("/wallet")||pathname.includes("treasury"))return{type:"TREASURY",id:"treasury",label:"Treasury",source:"ROUTE"};
  if(pathname.startsWith("/crowdfunding"))return{type:"FUNDING_ROUND",id:"funding",label:"Funding Round",source:"ROUTE"};
  if(pathname.startsWith("/docs"))return{type:"DOCUMENT",id:"documents",label:"Documents",source:"ROUTE"};
  if(pathname.startsWith("/digital-energy"))return{type:"WORKSPACE",id:"digital-energy",label:"Digital Energy OS",source:"ROUTE"};
  return{type:"WORKSPACE",id:"powerchain",label:"PowerChain Workspace",source:"ROUTE"};
}

export function GlobalCopilot(){
  const pathname=usePathname();
  const {copilotOpen,setCopilotOpen}=useApp();
  const route=useMemo(()=>routeContext(pathname),[pathname]);
  const [mode,setMode]=useState<CopilotMode>("ASK");
  const [input,setInput]=useState("");
  const [contexts,setContexts]=useState<CopilotContextRef[]>([]);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<RunResult|null>(null);
  const [error,setError]=useState<string|null>(null);

  const activeContexts=useMemo(()=>{
    const all=[route,...contexts];
    const seen=new Set<string>();
    return all.filter(item=>{const key=`${item.type}:${item.id}`;if(seen.has(key))return false;seen.add(key);return true});
  },[route,contexts]);
  const suggestions=contextSuggestions(route.type);

  function addContext(type:CopilotContextType,label:string){
    const id=`manual-${type.toLowerCase()}`;
    setContexts(current=>current.some(item=>item.type===type)?current:[...current,{type,id,label,source:"USER"}]);
    const mention=`@${label.replaceAll(" ","")}`;
    setInput(current=>current.includes(mention)?current:`${current}${current?" ":""}${mention} `);
  }

  async function run(prompt=input){
    const message=prompt.trim();
    if(!message||busy)return;
    setBusy(true);
    setError(null);
    try{
      const response=await fetch("/api/v1/copilot/run",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({message,mode,contexts:activeContexts}),
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload?.error?.message??"PowerChain Copilot failed");
      setResult(payload.data);
      if(prompt===input)setInput("");
    }catch(cause){
      setError(cause instanceof Error?cause.message:"PowerChain Copilot is unavailable");
    }finally{
      setBusy(false);
    }
  }

  return <>
    {copilotOpen&&<button className="copilot-backdrop" aria-label="Close PowerChain Copilot" onClick={()=>setCopilotOpen(false)}/>}
    <aside className={`copilot-drawer ${copilotOpen?"open":""}`} aria-hidden={!copilotOpen} aria-label="PowerChain Copilot">
      <header className="copilot-header">
        <div className="copilot-brand-mark"><Sparkles/></div>
        <div className="min-w-0 flex-1">
          <span>POWERCHAIN COPILOT</span>
          <strong>Renewable RWA operating intelligence</strong>
        </div>
        <button type="button" className="icon-button" aria-label="Close Copilot" onClick={()=>setCopilotOpen(false)}><X/></button>
      </header>

      <div className="copilot-mode-tabs" role="tablist" aria-label="Copilot modes">
        {MODES.map(item=><button key={item.id} type="button" role="tab" aria-selected={mode===item.id} onClick={()=>setMode(item.id)} className={mode===item.id?"active":""}><strong>{item.label}</strong><small>{item.detail}</small></button>)}
      </div>

      <div className="copilot-context-bar">
        <span>Current context</span>
        <div>{activeContexts.map(item=><span key={`${item.type}:${item.id}`} className="copilot-context-chip">{item.label}</span>)}</div>
      </div>

      <div className="copilot-scroll">
        {!result&&!busy&&<section className="copilot-empty">
          <div className="copilot-empty-icon"><Bot/></div>
          <h2>What can I help you operate?</h2>
          <p>Copilot understands the current PowerChain workspace and coordinates specialist agents only when they are useful.</p>
          <div className="copilot-suggestions">
            {suggestions.map(item=><button type="button" key={item} onClick={()=>void run(item)}><Sparkles/><span>{item}</span><ChevronRight/></button>)}
          </div>
        </section>}

        {busy&&<section className="copilot-execution">
          <div className="copilot-run-title"><Sparkles className="copilot-spin"/><div><span>RWA ORCHESTRATOR</span><strong>Planning and coordinating work…</strong></div></div>
          <div className="copilot-agent-line"><Circle/><div><strong>Context resolution</strong><small>Scoping the minimum relevant PowerChain context</small></div></div>
          <div className="copilot-agent-line"><Circle/><div><strong>Agent selection</strong><small>Choosing specialist workforce and reusable skills</small></div></div>
        </section>}

        {result&&!busy&&<section className="copilot-result">
          <div className="copilot-run-title">{result.executionMode==="provider"?<CheckCircle2/>:<ShieldCheck/>}<div><span>{result.executionMode==="provider"?"ANALYSIS COMPLETE":"PLAN PREPARED"}</span><strong>{result.executionMode==="provider"?`${result.plan.steps.length} agent${result.plan.steps.length===1?"":"s"} coordinated`:"Live model/data execution is not configured"}</strong></div></div>
          <div className="copilot-agent-activity">
            {result.plan.steps.map(step=><div className="copilot-agent-line" key={step.id}>{step.status==="COMPLETED"?<CheckCircle2/>:<Circle/>}<div><strong>{step.agentName}</strong><small>{step.status==="BLOCKED"?"Planned · provider/data connector required":step.skills.join(" · ")}</small></div></div>)}
          </div>
          <article className="copilot-answer">
            <span>{mode}</span>
            <p>{result.answer}</p>
            <small>{result.modelId} · {result.provider}</small>
          </article>
          {result.action&&<article className="copilot-action-draft">
            <div><LockKeyhole/><span>ACTION DRAFT · {result.action.risk}</span></div>
            <strong>{result.action.title}</strong>
            <p>{result.action.description}</p>
            <div className="copilot-action-boundary">
              <ShieldCheck/>
              <span>{result.action.requiresWalletSignature?"Human approval first. Wallet signs separately.":"Human approval required before the draft is recorded."}</span>
            </div>
            <Link href="/copilot/action-center">Review in Action Center <ChevronRight/></Link>
          </article>}
          <div className="copilot-result-links">
            <Link href="/copilot/action-center"><LockKeyhole/>Action Center</Link>
            <Link href="/copilot"><FileSearch/>Open full workspace</Link>
          </div>
        </section>}
      </div>

      <footer className="copilot-composer">
        {error&&<div className="copilot-error">{error}</div>}
        <div className="copilot-context-add">
          {ADD_CONTEXT.map(item=><button type="button" key={item.type} onClick={()=>addContext(item.type,item.label)}>@{item.label.replaceAll(" ","")}</button>)}
        </div>
        <div className="copilot-input-shell">
          <textarea
            value={input}
            maxLength={2000}
            onChange={event=>setInput(event.target.value)}
            onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void run()}}}
            placeholder="Ask PowerChain Copilot…"
            aria-label="Ask PowerChain Copilot"
            rows={3}
          />
          <div><span>{input.length}/2000</span><button type="button" disabled={!input.trim()||busy} onClick={()=>void run()} aria-label="Send to Copilot"><ArrowUp/></button></div>
        </div>
        <p>AI can research, analyze, coordinate and prepare. High-impact actions require explicit approval; agents never sign wallet transactions.</p>
      </footer>
    </aside>
  </>;
}
