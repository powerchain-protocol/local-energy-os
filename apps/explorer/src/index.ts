import { ApplicationError, createApplication, json } from "@powerchain/application-runtime";

export const applicationName = "explorer" as const;

const networks = {
  "solana-devnet": { family: "solana", explorer: "https://explorer.solana.com", query: "?cluster=devnet" },
  "solana-mainnet-beta": { family: "solana", explorer: "https://explorer.solana.com", query: "" },
  "sui-devnet": { family: "sui", explorer: "https://suiscan.xyz/devnet", query: "" },
  "sui-testnet": { family: "sui", explorer: "https://suiscan.xyz/testnet", query: "" },
  "sui-mainnet": { family: "sui", explorer: "https://suiscan.xyz/mainnet", query: "" },
} as const;

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Explorer",
    version: "1.0.0",
    description: "Canonical network-aware transaction and address explorer links.",
    basePath: "/api/v1/explorer",
    capabilities: ["solana", "sui", "transactions", "addresses"],
  },
  routes: [
    { method: "GET", path: "/api/v1/explorer/networks", summary: "List supported explorer networks", handler: () => json({ data: Object.keys(networks) }) },
    { method: "GET", path: "/api/v1/explorer/:network/:kind/:identifier", summary: "Resolve a canonical explorer URL", handler(_request, { params }) {
      const network = networks[params.network as keyof typeof networks];
      if (!network) throw new ApplicationError("NETWORK_NOT_SUPPORTED", "Explorer network is not supported", 404);
      if (params.kind !== "transaction" && params.kind !== "address") throw new ApplicationError("KIND_NOT_SUPPORTED", "kind must be transaction or address");
      if (params.identifier.length < 16 || params.identifier.length > 128) throw new ApplicationError("INVALID_IDENTIFIER", "Network identifier length is invalid");
      const segment = network.family === "solana" ? (params.kind === "transaction" ? "tx" : "address") : (params.kind === "transaction" ? "tx" : "account");
      return json({ network: params.network, kind: params.kind, identifier: params.identifier, url: `${network.explorer}/${segment}/${encodeURIComponent(params.identifier)}${network.query}` });
    } },
  ],
});
