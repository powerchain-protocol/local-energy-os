import { PageHeader, Panel, StatusBadge } from "@powerchain/ui";

const links = [
  ["Swagger API Reference", "/docs", "Interactive OpenAPI 3.1 documentation", "Interactive"],
  ["OpenAPI YAML", "/openapi.yaml", "Canonical machine-readable API contract", "Contract"],
  ["Health", "/api/v1/health", "API liveness and canonical version", "Runtime"],
  ["System Health", "/api/v1/system/health", "Platform subsystem status", "Operations"],
] as const;

export default function ApiHome() {
  return <main className="pc-page">
    <PageHeader eyebrow="Developer Platform" title="Local Energy OS API" description="Typed control-plane APIs for verified energy, Energy RWA, PWRC, SaaS entitlements, grid operations, charging, cross-chain routing and infrastructure provenance." action={<StatusBadge tone="success">OpenAPI 3.1</StatusBadge>} />
    <div className="pc-grid">
      <Panel className="pc-span-8" eyebrow="API v1" title="Canonical developer contract">
        <p className="api-lead">The API keeps physical energy, financial settlement, blockchain execution and reward state as explicit domain boundaries. Swagger and Postman derive from the same canonical route surface.</p>
        <div className="api-actions"><a className="pc-button" href="/docs">Open Swagger</a><a className="pc-button is-secondary" href="/openapi.yaml">Open OpenAPI YAML</a></div>
      </Panel>
      <Panel className="pc-span-4" eyebrow="Runtime" title="Developer access">
        <div className="pc-data-list"><div className="pc-data-row"><div><strong>Namespace</strong><p>Versioned control plane</p></div><span>/api/v1</span></div><div className="pc-data-row"><div><strong>Schema</strong><p>Machine-readable contract</p></div><span>OpenAPI 3.1</span></div><div className="pc-data-row"><div><strong>Auth</strong><p>Session and Solana verification</p></div><span>Policy-bound</span></div></div>
      </Panel>
      {links.map(([title, href, description, badge]) => <a className="api-resource pc-span-3" href={href} key={href}><span className="api-resource-badge">{badge}</span><strong>{title}</strong><p>{description}</p><span className="api-resource-link">Open resource →</span></a>)}
    </div>
  </main>;
}
