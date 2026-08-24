import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, LockKeyhole, Network, Sparkles } from "lucide-react";

export function CopilotArchitecturePanel({compact=false}:{compact?:boolean}){
  return <section className="copilot-architecture-visual">
    <div className="copilot-architecture-visual-head">
      <div>
        <span className="eyebrow">COPILOT ARCHITECTURE</span>
        <h2>{compact?"Unified Renewable RWA intelligence":"From operator intent to controlled execution"}</h2>
        <p>One contextual interface coordinates the RWA Orchestrator, specialist agents, reusable skills, Action Center review and explicit human/wallet control.</p>
      </div>
      <div className="copilot-architecture-visual-actions">
        <Link href="/copilot/architecture"><Network className="h-4 w-4"/>Architecture</Link>
        <a href="/images/architectures/powerchain-copilot-architecture.png" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/>Full size</a>
      </div>
    </div>

    <div className="copilot-architecture-image-shell">
      <Image
        src="/images/architectures/powerchain-copilot-architecture.png"
        alt="PowerChain Copilot architecture showing Ask, Analyze, Research and Act flowing through the RWA Orchestrator, specialist agents, skills, Action Center, human approval and wallet signature."
        width={1672}
        height={941}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1200px"
        className="copilot-architecture-image"
        priority={!compact}
      />
    </div>

    {!compact&&<div className="copilot-architecture-principles">
      <article><Sparkles/><div><strong>Copilot is the interface</strong><span>Global and contextual across PowerChain products.</span></div></article>
      <ArrowRight className="copilot-architecture-arrow"/>
      <article><Network/><div><strong>Orchestrator coordinates</strong><span>Plans work and selects the minimum useful agents and skills.</span></div></article>
      <ArrowRight className="copilot-architecture-arrow"/>
      <article><LockKeyhole/><div><strong>Humans remain in control</strong><span>High-impact actions require explicit approval and external wallet signing.</span></div></article>
    </div>}
  </section>;
}
