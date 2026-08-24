import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { COPILOT_AGENTS, COPILOT_SKILLS } from "@powerchain/copilot";
import { Shell } from "@/components/shell";
import { OpenCopilotButton } from "@/components/copilot/open-copilot-button";
import { CopilotArchitecturePanel } from "@/components/copilot/copilot-architecture-panel";

export default function CopilotPage(){
  return <Shell><div className="content-container space-y-6">
    <section className="copilot-product-hero">
      <span className="eyebrow">POWERCHAIN COPILOT · RENEWABLE RWA AI AGENT SYSTEM</span>
      <h1>Your Renewable RWA operating intelligence.</h1>
      <p>Ask naturally. Agents do the analysis. Skills execute the work. You stay in control. Copilot is the interface, specialist agents are the workforce, reusable skills are the capabilities, and the RWA Orchestrator coordinates execution.</p>
      <div className="copilot-product-actions"><OpenCopilotButton/><Link className="secondary" href="/copilot/action-center"><LockKeyhole className="h-4 w-4"/>Action Center</Link></div>
    </section>

    <CopilotArchitecturePanel compact/>

    <section className="panel p-5 sm:p-6">
      <div className="dashboard-card-head"><div><span className="eyebrow">CORE ARCHITECTURE</span><h2>One interface. Coordinated specialist execution.</h2></div><Link href="/copilot/architecture">Architecture details →</Link></div>
      <div className="copilot-architecture mt-5">
        <article><span>INTERFACE</span><h3>PowerChain Copilot</h3><p>Ask · Analyze · Research · Act. Global, contextual and available from every operator workspace.</p></article>
        <ArrowRight/>
        <article><span>COORDINATION</span><h3>RWA Orchestrator</h3><p>Understands the request, builds the plan, scopes context, delegates agents, validates outputs and prepares approval-safe actions.</p></article>
        <ArrowRight/>
        <article><span>WORKFORCE + CAPABILITIES</span><h3>Agents + Skills</h3><p>Research, asset analysis, risk, capital, verification, documents, impact, reporting and operator workflows use reusable skills.</p></article>
      </div>
    </section>

    <section>
      <div className="dashboard-card-head"><div><span className="eyebrow">CORE RENEWABLE RWA AGENTS</span><h2>Visible specialist workforce</h2></div><Link href="/copilot/agents">View all agents →</Link></div>
      <div className="copilot-registry-grid mt-4">
        {COPILOT_AGENTS.slice(0,6).map(agent=><article className="copilot-registry-card" key={agent.id}><span>AGENT</span><h3>{agent.name}</h3><p>{agent.purpose}</p><div className="copilot-tag-row">{agent.skills.map(skill=><span key={skill}>{skill}</span>)}</div></article>)}
      </div>
    </section>

    <section>
      <div className="dashboard-card-head"><div><span className="eyebrow">SKILL LAYER</span><h2>Reusable capabilities, not monolithic agents</h2></div><Link href="/copilot/skills">Explore skills →</Link></div>
      <div className="copilot-registry-grid mt-4">
        {COPILOT_SKILLS.slice(0,6).map(skill=><article className="copilot-registry-card" key={skill.id}><span>{skill.category}</span><h3>{skill.name}</h3><p>{skill.description}</p><div className="copilot-tag-row">{skill.permissions.map(permission=><span key={permission}>{permission}</span>)}</div></article>)}
      </div>
    </section>

    <section className="panel p-5 sm:p-6">
      <span className="eyebrow">CONTROL BOUNDARY</span>
      <h2 className="mt-2 text-xl font-semibold">AI prepares. Humans approve. Wallets sign.</h2>
      <div className="copilot-safety-chain mt-4"><span>READ</span><ArrowRight/><span>ANALYZE</span><ArrowRight/><span>DRAFT</span><ArrowRight/><span>RECOMMEND</span><ArrowRight/><span>REQUEST APPROVAL</span><ArrowRight/><span>HUMAN APPROVES</span><ArrowRight/><span>WALLET SIGNS</span></div>
      <p className="mt-4 text-sm text-[var(--muted)]">No agent can silently move funds, change critical asset records or sign transactions. Wallet signatures remain external human actions.</p>
    </section>
  </div></Shell>;
}
