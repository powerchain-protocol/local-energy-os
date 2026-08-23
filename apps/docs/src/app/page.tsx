import Link from "next/link";
import { DocsShell } from "@/components/docs/docs-shell";
import { DOCS } from "@/lib/docs";

const principles = [
  ["Physical energy", "Metered and verified physical reality remains authoritative."],
  ["Energy RWA", "kWh and MWh positions remain bounded by canonical integer Wh backing."],
  ["PWRC", "Native PowerChain utility and reward asset on Solana; not electricity."],
  ["wPWRC", "1:1 bridge-backed representation of PWRC on Sui."],
];

export default function DocsHome() {
  const featured = DOCS.filter((doc) => doc.featured);

  return (
    <DocsShell>
      <section className="docs-hero">
        <div>
          <span className="eyebrow">CANONICAL DOCUMENTATION · V1.0.0</span>
          <h1>PowerChain Local Energy OS</h1>
          <p>
            Full-stack documentation for physical energy, smart metering, local markets,
            verified Energy RWA, SaaS, Solana, Sui and autonomous machine services.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/whitepaper">Read the whitepaper</Link>
            <Link className="secondary-button" href="/architecture">Explore architecture</Link>
          </div>
        </div>
        <div className="hero-principle">
          <span>Canonical principle</span>
          <strong>PowerChain coordinates energy; it does not invent energy.</strong>
          <p>Every digital Energy RWA traces back to verified physical supply.</p>
        </div>
      </section>

      <section className="principle-grid" aria-label="Canonical asset principles">
        {principles.map(([title, description]) => (
          <article key={title}>
            <span className="card-kicker">{title}</span>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">START HERE</span>
          <h2>Core documentation</h2>
        </div>
      </section>

      <section className="doc-card-grid">
        {featured.map((doc) => (
          <Link className="doc-card" href={`/${doc.slug}`} key={doc.slug}>
            <div>
              <span>{doc.group}</span>
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
            </div>
            <strong aria-hidden="true">→</strong>
          </Link>
        ))}
      </section>

      <section className="system-flow">
        <span className="eyebrow">CANONICAL OPERATING SEQUENCE</span>
        <div className="flow-list">
          {[
            "Measure",
            "Verify",
            "Locate",
            "Prove",
            "Position",
            "Reserve",
            "Route",
            "Trade",
            "Deliver",
            "Reconcile",
            "Settle",
            "Retire",
            "Reward",
          ].map((item, index, all) => (
            <span key={item}>
              {item}
              {index < all.length - 1 ? <i aria-hidden="true">→</i> : null}
            </span>
          ))}
        </div>
      </section>
    </DocsShell>
  );
}
