import { ArrowRight, Bot, Boxes, LockKeyhole, Network, Sparkles, WalletCards } from "lucide-react";
import { Shell } from "@/components/shell";
import { CopilotArchitecturePanel } from "@/components/copilot/copilot-architecture-panel";

const stages=[
  ["01","PowerChain Copilot","Ask · Analyze · Research · Act",Sparkles],
  ["02","RWA Orchestrator","Understand intent, scope context, select agents and coordinate execution.",Network],
  ["03","Specialist Agents","Researcher · Analyst · Risk · Capital · Operator · Verification · Reporting · Impact · Launch",Bot],
  ["04","Reusable Skills","Asset analysis · forecasts · anomalies · documents · treasury · funding · RWA verification · workflows",Boxes],
  ["05","Action Center","Findings and high-impact drafts become explicit review items.",LockKeyhole],
  ["06","Human + Wallet","Human approval precedes any external wallet signature or critical execution.",WalletCards],
] as const;

export default function CopilotArchitecturePage(){
  return <Shell><div className="content-container space-y-6">
    <header className="copilot-product-hero">
      <span className="eyebrow">POWERCHAIN COPILOT · ARCHITECTURE</span>
      <h1>Operator intelligence without surrendering execution control.</h1>
      <p>PowerChain Copilot sits above authoritative product domains. It coordinates AI work, but physical energy, financial settlement, chain state and wallet authority remain governed by their source-of-record systems.</p>
    </header>

    <CopilotArchitecturePanel/>

    <section className="panel p-5 sm:p-6">
      <div className="dashboard-card-head"><div><span className="eyebrow">EXECUTION STACK</span><h2>Six explicit control layers</h2></div></div>
      <div className="copilot-architecture-stage-grid mt-5">
        {stages.map(([index,title,description,Icon],position)=><article key={index}>
          <div className="copilot-architecture-stage-top"><span>{index}</span><Icon/></div>
          <h3>{title}</h3>
          <p>{description}</p>
          {position<stages.length-1&&<ArrowRight className="copilot-stage-arrow"/>}
        </article>)}
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <article className="dashboard-panel">
        <span className="eyebrow">CONTEXT BOUNDARY</span>
        <h2 className="mt-2 text-lg font-semibold">Company OS → Renewable RWA → Agent scope</h2>
        <div className="copilot-context-stack mt-4">
          <div><strong>Company OS</strong><span>Brand · Products · Business Rules · Policies · Organization · Operating Principles</span></div>
          <ArrowRight/>
          <div><strong>Renewable RWA</strong><span>Assets · Projects · Funding · Documents · Treasury · Energy Data · Risk Rules</span></div>
          <ArrowRight/>
          <div><strong>Agent Context</strong><span>Only the minimum context required for the selected task.</span></div>
        </div>
      </article>

      <article className="dashboard-panel">
        <span className="eyebrow">AUTHORITY BOUNDARY</span>
        <h2 className="mt-2 text-lg font-semibold">AI prepares. Humans approve. Wallets sign.</h2>
        <div className="copilot-authority-list mt-4">
          <div><span>01</span><strong>READ / ANALYZE</strong><small>Evidence and insight only.</small></div>
          <div><span>02</span><strong>DRAFT / RECOMMEND</strong><small>Creates reviewable work, never silent execution.</small></div>
          <div><span>03</span><strong>REQUEST APPROVAL</strong><small>High-impact action enters the Action Center.</small></div>
          <div><span>04</span><strong>HUMAN APPROVES</strong><small>Identity and decision actor are recorded.</small></div>
          <div><span>05</span><strong>WALLET SIGNS EXTERNALLY</strong><small>Copilot records the external reference but never signs.</small></div>
        </div>
      </article>
    </section>

    <section className="dashboard-panel">
      <span className="eyebrow">SOURCE OF TRUTH</span>
      <h2 className="mt-2 text-lg font-semibold">Copilot does not become another ledger.</h2>
      <div className="copilot-source-grid mt-4">
        <article><strong>Physical Energy</strong><span>Meters · telemetry · evidence · Energy Ledger</span></article>
        <article><strong>Energy RWA</strong><span>PET-20 · backing · reservations · retirement</span></article>
        <article><strong>Financial</strong><span>Settlement controls · treasury · accounting</span></article>
        <article><strong>Networks</strong><span>Solana · Sui · explorers · transaction references</span></article>
      </div>
    </section>
  </div></Shell>;
}
