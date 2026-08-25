import { DocCallout, DocCardGrid, DocsShell } from "../../../components/docs";

export default function DocsHome() {
  return (
    <DocsShell>
      <section className="docs-home-hero">
        <span className="doc-eyebrow">POWERCHAIN DOCUMENTATION</span>
        <h1>Build on the Local Energy OS.</h1>
        <p>Canonical v1.0.0 documentation for physical energy, kWh/MWh Energy RWA, PWRC, wPWRC, SaaS, API v1, protocols and full-stack infrastructure.</p>
      </section>
      <DocCallout title="Core invariant">PowerChain coordinates energy; it does not invent energy. Economically active Energy RWA can never exceed verified physical supply.</DocCallout>
      <DocCardGrid items={[
        { href: "/architecture", title: "Architecture", description: "Understand control plane, Energy Ledger, markets, settlement and chain boundaries." },
        { href: "/energy-rwa", title: "Energy RWA", description: "Implement physically backed kWh and MWh positions with canonical Wh accounting." },
        { href: "/pwrc", title: "PWRC & wPWRC", description: "Native Solana PWRC and the fully backed Sui bridge representation." },
        { href: "/api", title: "API v1", description: "Context-aware resources for participants, energy, SaaS and settlement." },
        { href: "/storage", title: "Storage", description: "Evidence, report, export and integration-object storage boundaries." },
        { href: "/store", title: "Store", description: "Small client-state primitives without duplicating server authority." }
      ]} />
    </DocsShell>
  );
}
