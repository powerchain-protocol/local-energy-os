import { createApplication } from "@powerchain/application-runtime";

export const applicationName = "web" as const;
export const applicationRoute = "/" as const;

function safeUrl(value: string | undefined, fallback: string) {
  try {
    const url = new URL(value ?? fallback);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.toString();
  } catch { return fallback; }
}

export function renderLandingPage() {
  const platformUrl = safeUrl(process.env.PLATFORM_URL, "http://localhost:3000");
  const docsUrl = safeUrl(process.env.DOCS_URL, "http://localhost:3005");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PowerChain — Digital energy infrastructure</title><meta name="description" content="Operate renewable assets, energy markets, settlement, and AI workflows from one secure platform.">
<style>:root{color-scheme:light;--ink:#0b1712;--muted:#526158;--line:#dce5df;--green:#0a5c3d;--soft:#f4f7f5}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:#fff}a{color:inherit}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.brand{font-weight:760;letter-spacing:-.03em;text-decoration:none}.navlinks{display:flex;gap:20px;align-items:center}.navlinks a{text-decoration:none;font-size:14px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 20px;border-radius:10px;background:var(--green);color:#fff;font-weight:700;text-decoration:none}.hero{padding:96px 0 72px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:72px;align-items:center}.eyebrow{font-size:13px;font-weight:750;text-transform:uppercase;letter-spacing:.12em;color:var(--green)}h1{font-size:clamp(44px,6vw,72px);line-height:1.02;letter-spacing:-.055em;margin:18px 0 24px;max-width:820px}.lead{font-size:20px;line-height:1.6;color:var(--muted);max-width:680px}.actions{display:flex;align-items:center;gap:18px;margin-top:34px}.textlink{font-weight:700;text-underline-offset:4px}.proof{display:flex;gap:24px;margin-top:38px;color:var(--muted);font-size:14px}.panel{background:var(--soft);border:1px solid var(--line);border-radius:18px;padding:28px}.panel h2{margin:0 0 22px;font-size:18px}.metric{display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid var(--line)}.metric strong{font-size:14px}.metric span{font-size:14px;color:var(--muted)}.status{display:inline-flex;align-items:center;gap:8px;color:var(--green);font-size:13px;font-weight:700}.dot{width:8px;height:8px;border-radius:50%;background:#16a36c}.features{padding:32px 0 88px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{border:1px solid var(--line);border-radius:14px;padding:24px}.card h2{font-size:17px;margin:0 0 10px}.card p{margin:0;color:var(--muted);line-height:1.6;font-size:15px}@media(max-width:760px){.navlinks>a:not(.button){display:none}.hero{grid-template-columns:1fr;padding:64px 0 44px;gap:38px}.features{grid-template-columns:1fr;padding-bottom:56px}.proof{flex-direction:column;gap:8px}.actions{align-items:stretch;flex-direction:column}.textlink{text-align:center}}</style></head>
<body><header class="wrap nav"><a class="brand" href="/">POWERCHAIN</a><nav class="navlinks" aria-label="Primary"><a href="${docsUrl}">Documentation</a><a class="button" href="${platformUrl}">Open Command Center</a></nav></header>
<main><section class="wrap hero"><div><p class="eyebrow">Digital energy operating system</p><h1>Turn energy operations into auditable action.</h1><p class="lead">Coordinate renewable assets, metering, markets, settlement, and AI-assisted workflows without giving up control of approvals or wallet signing.</p><div class="actions"><a class="button" href="${platformUrl}">Open Command Center</a><a class="textlink" href="${docsUrl}">Explore the architecture</a></div><div class="proof"><span>Non-custodial signing</span><span>Multi-network infrastructure</span><span>Version 1.0.0</span></div></div><aside class="panel" aria-label="Platform readiness"><div class="status"><span class="dot"></span>Platform operational</div><h2>One coordinated control plane</h2><div class="metric"><strong>Asset operations</strong><span>Live telemetry</span></div><div class="metric"><strong>Settlement</strong><span>Review before signing</span></div><div class="metric"><strong>AI workflows</strong><span>Approval controlled</span></div><div class="metric"><strong>Integrations</strong><span>Isolated adapters</span></div></aside></section>
<section class="wrap features" aria-label="Platform capabilities"><article class="card"><h2>Operate</h2><p>Monitor assets, meters, incidents, maintenance, and energy performance through one shared operational model.</p></article><article class="card"><h2>Transact</h2><p>Prepare transparent checkout, marketplace, tokenization, and settlement flows while the wallet remains the signer.</p></article><article class="card"><h2>Automate safely</h2><p>Route AI and integration work through explicit permissions, cost boundaries, audit records, and human approvals.</p></article></section></main></body></html>`;
}

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Web",
    version: "1.0.0",
    description: "Public PowerChain product entry point.",
    basePath: "/",
    capabilities: ["marketing", "product-discovery", "platform-entry"],
  },
  routes: [{ method: "GET", path: "/", summary: "Render the public landing page", handler: () => new Response(renderLandingPage(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }) }],
});
