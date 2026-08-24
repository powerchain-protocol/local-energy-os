import { COPILOT_AGENTS, COPILOT_SKILLS } from "@powerchain/copilot";
import { Shell } from "@/components/shell";
import { DocsHero } from "@/components/docs";

export default function AiDocs(){
  return <Shell><div className="space-y-6">
    <DocsHero/>
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700">PowerChain Copilot · v1.0.0</p>
      <h2 className="mt-2 text-2xl font-semibold">Copilot is the interface. Agents are the workforce. Skills are the capabilities.</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">The RWA Orchestrator scopes context and coordinates Renewable RWA agents across Digital Energy OS, assets, Energy RWA, treasury, funding, documents and operator workflows. High-impact actions remain behind human approval and external wallet signatures.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{COPILOT_AGENTS.map(agent=><div key={agent.id} className="rounded-2xl bg-emerald-950 p-4 text-white"><p className="font-semibold">{agent.name}</p><p className="mt-1 text-xs text-emerald-100/70">{agent.skills.join(" · ")}</p></div>)}</div>
      <h3 className="mt-8 text-lg font-semibold">Reusable skill layer</h3>
      <div className="mt-3 flex flex-wrap gap-2">{COPILOT_SKILLS.map(skill=><span key={skill.id} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold">{skill.name}</span>)}</div>
    </section>
  </div></Shell>
}
