import { PowerChainSwagger } from "./swagger";

export const metadata = {
  title: "Swagger API Reference | PowerChain",
  description: "Interactive OpenAPI reference for PowerChain Local Energy OS API v1.",
};

export default function ApiDocsPage() {
  return (
    <main>
      <div className="api-docs-banner">
        <strong>PowerChain Local Energy OS API v1</strong>
        <span>OpenAPI 3.1 · Canonical version 1.0.0</span>
      </div>
      <PowerChainSwagger />
    </main>
  );
}
