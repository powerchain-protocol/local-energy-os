"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { COPILOT_SKILLS, type CopilotSkillId } from "@powerchain/copilot";
import { Shell } from "@/components/shell";

const KEY="powerchain:copilot-agent-drafts:v1";

type Draft={
  id:string;
  name:string;
  role:string;
  skills:CopilotSkillId[];
  dataAccess:string[];
  permissions:string[];
  createdAt:string;
};

export default function CopilotAgentBuilderPage(){
  const[name,setName]=useState("Maintenance Intelligence Agent");
  const[role,setRole]=useState("Monitor renewable asset maintenance");
  const[skills,setSkills]=useState<CopilotSkillId[]>(["asset-analysis","anomaly-detection","workflow-planning"]);
  const[dataAccess,setDataAccess]=useState<string[]>(["Assigned Assets","Maintenance Documents","Historical Performance"]);
  const[saved,setSaved]=useState<Draft[]>([]);

  useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem(KEY)??"[]"))}catch{setSaved([])}},[]);

  function toggleSkill(id:CopilotSkillId){setSkills(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id])}
  function save(){
    const draft:Draft={
      id:`custom_${crypto.randomUUID()}`,
      name:name.trim()||"Custom Copilot Agent",
      role:role.trim()||"Scoped PowerChain operating agent",
      skills,
      dataAccess,
      permissions:["READ","ANALYZE","DRAFT","RECOMMEND","REQUEST_APPROVAL"],
      createdAt:new Date().toISOString(),
    };
    const next=[draft,...saved].slice(0,20);
    setSaved(next);
    localStorage.setItem(KEY,JSON.stringify(next));
  }

  return <Shell><div className="content-container space-y-6">
    <header className="copilot-product-hero"><span className="eyebrow">COPILOT AGENT BUILDER</span><h1>Build scoped agents without weakening operator control.</h1><p>Custom agents are saved as drafts. Read, analyze and draft permissions can be configured; autonomous fund movement and wallet signing remain unavailable.</p></header>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
      <article className="dashboard-panel space-y-5">
        <div className="dashboard-card-head"><div><span className="eyebrow">AGENT DEFINITION</span><h2>Role and capabilities</h2></div><ShieldCheck className="h-5 w-5 text-emerald-700"/></div>
        <label className="block text-sm font-semibold">Name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 font-normal"/></label>
        <label className="block text-sm font-semibold">Role<textarea value={role} onChange={e=>setRole(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 font-normal"/></label>

        <div><span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Skills</span><div className="mt-3 grid gap-2 sm:grid-cols-2">{COPILOT_SKILLS.map(skill=><label key={skill.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={skills.includes(skill.id)} onChange={()=>toggleSkill(skill.id)} className="mt-1"/><span><strong>{skill.name}</strong><small className="mt-1 block text-[var(--muted)]">{skill.description}</small></span></label>)}</div></div>

        <div><span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Data access</span><div className="mt-3 grid gap-2 sm:grid-cols-2">{["Assigned Assets","Maintenance Documents","Historical Performance","Energy RWA","Treasury","Funding Rounds"].map(item=><label key={item} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={dataAccess.includes(item)} onChange={()=>setDataAccess(current=>current.includes(item)?current.filter(v=>v!==item):[...current,item])}/>{item}</label>)}</div></div>
        <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"><Save className="h-4 w-4"/>Save agent draft</button>
      </article>

      <aside className="space-y-4">
        <article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">PERMISSION MODEL</span><h2>Maximum custom-agent authority</h2></div><LockKeyhole className="h-5 w-5 text-emerald-700"/></div><div className="copilot-safety-chain mt-4"><span>READ</span><span>ANALYZE</span><span>DRAFT</span><span>RECOMMEND</span><span>REQUEST APPROVAL</span></div><div className="mt-4 space-y-2 text-sm"><p className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Create draft tasks and reports</p><p className="flex items-center gap-2 text-[var(--muted)]"><LockKeyhole className="h-4 w-4"/>Execute financial actions — disabled</p><p className="flex items-center gap-2 text-[var(--muted)]"><LockKeyhole className="h-4 w-4"/>Sign transactions — disabled</p></div></article>
        <article className="dashboard-panel"><span className="eyebrow">LOCAL DRAFTS</span><h2 className="mt-2 text-lg font-semibold">{saved.length} saved</h2><p className="mt-2 text-sm text-[var(--muted)]">Builder drafts remain local configuration until an administrator publishes them through a future governed agent registry.</p></article>
      </aside>
    </section>
  </div></Shell>
}
