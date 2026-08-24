"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LockKeyhole, RefreshCw, ShieldCheck, WalletCards, XCircle } from "lucide-react";
import { Shell } from "@/components/shell";

type Action = {
  id:string;title:string;description:string;state:string;risk:string;requiresWalletSignature:boolean;
  createdBy:string;humanApprovedBy?:string;rejectedBy?:string;createdAt:string;updatedAt:string;
};

export function CopilotActionCenterWorkspace(){
  const[actions,setActions]=useState<Action[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState<string|null>(null);
  const[error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch("/api/v1/copilot/actions",{cache:"no-store"});
      const body=await response.json();
      if(!response.ok)throw new Error(body?.error?.message??"Action Center unavailable");
      setActions(body.data);
      setError(null);
    }catch(cause){setError(cause instanceof Error?cause.message:"Action Center unavailable")}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{void load()},[load]);

  async function recordWalletSignature(action:Action){
    const reference=window.prompt("Paste the wallet signature or transaction reference created outside Copilot");
    if(!reference?.trim())return;
    setBusy(`${action.id}:wallet`);
    try{
      const response=await fetch(`/api/v1/copilot/actions/${encodeURIComponent(action.id)}/wallet-signature`,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({walletSignatureReference:reference.trim()}),
      });
      const body=await response.json();
      if(!response.ok)throw new Error(body?.error?.message??"Wallet reference update failed");
      await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Wallet reference update failed")}
    finally{setBusy(null)}
  }

  async function decide(action:Action,decision:"approve"|"reject"){
    setBusy(`${action.id}:${decision}`);
    try{
      const response=await fetch(`/api/v1/copilot/actions/${encodeURIComponent(action.id)}/${decision}`,{method:"POST"});
      const body=await response.json();
      if(!response.ok)throw new Error(body?.error?.message??"Action update failed");
      await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Action update failed")}
    finally{setBusy(null)}
  }

  const attention=actions.filter(action=>action.state==="REVIEW_REQUIRED").length;
  const wallet=actions.filter(action=>action.state==="AWAITING_WALLET").length;

  return <Shell><div className="content-container space-y-6">
    <header className="copilot-product-hero">
      <span className="eyebrow">COPILOT ACTION CENTER</span>
      <h1>Review AI-prepared work before execution.</h1>
      <p>Findings and action drafts stay reviewable. Human approval is explicit, and wallet signatures remain outside the agent boundary.</p>
      <div className="copilot-product-actions"><button className="secondary" onClick={()=>void load()}><RefreshCw className={loading?"animate-spin h-4 w-4":"h-4 w-4"}/>Refresh</button></div>
    </header>

    {error&&<div className="digital-energy-error"><LockKeyhole/><div><strong>Action Center notice</strong><span>{error}</span></div></div>}

    <section className="operations-metric-grid">
      <article><LockKeyhole/><span>Needs review</span><strong>{attention}</strong></article>
      <article><WalletCards/><span>Awaiting wallet</span><strong>{wallet}</strong></article>
      <article><CheckCircle2/><span>Recorded</span><strong>{actions.filter(a=>a.state==="RECORDED").length}</strong></article>
      <article><ShieldCheck/><span>Agent wallet signing</span><strong>DISABLED</strong></article>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head"><div><span className="eyebrow">TODAY</span><h2>Copilot review queue</h2></div><span className="data-mode-chip live">{actions.length} actions</span></div>
      <div className="settlement-control-list">
        {actions.map(action=><article className="settlement-control-card" key={action.id}>
          <div><strong>{action.title}</strong><span>{action.createdBy} · {action.risk}</span></div>
          <dl>
            <div><dt>State</dt><dd>{action.state}</dd></div>
            <div><dt>Wallet</dt><dd>{action.requiresWalletSignature?"REQUIRED AFTER APPROVAL":"NOT REQUIRED"}</dd></div>
            <div><dt>Decision actor</dt><dd>{action.humanApprovedBy??action.rejectedBy??"—"}</dd></div>
            <div><dt>Action ID</dt><dd>{action.id}</dd></div>
          </dl>
          <div className="settlement-control-actions">
            {action.state==="REVIEW_REQUIRED"&&<>
              <button type="button" disabled={Boolean(busy)} onClick={()=>void decide(action,"approve")}><CheckCircle2/>{busy===`${action.id}:approve`?"Approving…":"Approve"}</button>
              <button type="button" className="danger" disabled={Boolean(busy)} onClick={()=>void decide(action,"reject")}><XCircle/>{busy===`${action.id}:reject`?"Rejecting…":"Reject"}</button>
            </>}
            {action.state==="AWAITING_WALLET"&&<button type="button" disabled={Boolean(busy)} onClick={()=>void recordWalletSignature(action)}><WalletCards/>{busy===`${action.id}:wallet`?"Recording…":"Record external wallet signature"}</button>}
            {action.state==="RECORDED"&&<span className="data-mode-chip live"><CheckCircle2/>Recorded</span>}
            {action.state==="REJECTED"&&<span className="data-mode-chip degraded"><XCircle/>Rejected</span>}
          </div>
        </article>)}
        {!actions.length&&!loading&&<p className="digital-energy-note">No Copilot action drafts yet. Use <strong>Act</strong> mode to prepare reviewable work.</p>}
      </div>
    </section>
  </div></Shell>;
}
