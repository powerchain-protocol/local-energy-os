import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) { const file = path.join(root, name); if (existsSync(file)) process.loadEnvFile(file); }
const action = process.argv[2] ?? "doctor";
const cluster = (process.env.SOLANA_CLUSTER || process.env.POWERCHAIN_NETWORK || "devnet").trim();
const heliusKey = process.env.HELIUS_API_KEY?.trim();
const heliusEnabled = process.env.HELIUS_ENABLED === "true" && Boolean(heliusKey);
const official = cluster === "mainnet-beta"
  ? { rpc: process.env.SOLANA_MAINNET_RPC_URL?.trim() || "https://api.mainnet.solana.com", ws: process.env.SOLANA_MAINNET_WS_URL?.trim() || "wss://api.mainnet.solana.com" }
  : { rpc: process.env.SOLANA_DEVNET_RPC_URL?.trim() || "https://api.devnet.solana.com", ws: process.env.SOLANA_DEVNET_WS_URL?.trim() || "wss://api.devnet.solana.com" };
const helius = cluster === "mainnet-beta"
  ? { rpc: `https://mainnet.helius-rpc.com/?api-key=${heliusKey ?? "<key>"}`, ws: `wss://atlas-mainnet.helius-rpc.com/?api-key=${heliusKey ?? "<key>"}` }
  : { rpc: `https://devnet.helius-rpc.com/?api-key=${heliusKey ?? "<key>"}`, ws: `wss://atlas-devnet.helius-rpc.com/?api-key=${heliusKey ?? "<key>"}` };
const configuredHeliusRpc = cluster === "mainnet-beta" ? process.env.HELIUS_MAINNET_RPC_URL?.trim() : process.env.HELIUS_DEVNET_RPC_URL?.trim();
const configuredHeliusWs = cluster === "mainnet-beta" ? process.env.HELIUS_MAINNET_WS_URL?.trim() : process.env.HELIUS_DEVNET_WS_URL?.trim();
const rpc = process.env.SOLANA_RPC_URL?.trim() || (heliusEnabled ? configuredHeliusRpc || helius.rpc : official.rpc);
const ws = process.env.SOLANA_WS_URL?.trim() || (heliusEnabled ? configuredHeliusWs || helius.ws : official.ws);
const program = process.env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID?.trim() || (cluster === "mainnet-beta" ? process.env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID_MAINNET?.trim() : process.env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID_DEVNET?.trim());
const mint = process.env.PWRC_MINT?.trim() || (cluster === "mainnet-beta" ? process.env.PWRC_MINT_MAINNET?.trim() : process.env.PWRC_MINT_DEVNET?.trim());
function redact(url) { return url.replace(/api-key=[^&]+/i, "api-key=<redacted>"); }
function print() { console.log(JSON.stringify({ cluster, provider: process.env.SOLANA_RPC_URL ? "custom" : heliusEnabled ? "helius" : "public", rpc: redact(rpc), websocket: redact(ws), energyRwaProgramId: program || "not-configured", pwrcMint: mint || "not-configured" }, null, 2)); }
if (!["devnet","mainnet-beta"].includes(cluster)) { console.error(`Unsupported SOLANA_CLUSTER: ${cluster}`); process.exit(1); }
if (action === "doctor" || action === "config" || action === "programs") {
  print();
  if (process.env.POWERCHAIN_ENVIRONMENT === "production" && cluster === "mainnet-beta" && !process.env.SOLANA_RPC_URL && !heliusEnabled) { console.error("Production mainnet requires a dedicated/custom RPC or Helius; public RPC is not accepted by PowerChain policy."); process.exit(1); }
  if (process.env.POWERCHAIN_WRITE_MODE === "enabled" && cluster === "mainnet-beta" && !program) { console.error("POWERCHAIN_ENERGY_RWA_PROGRAM_ID_MAINNET is required for enabled mainnet writes."); process.exit(1); }
  process.exit(0);
}
if (action === "devnet" || action === "mainnet") {
  const target = action === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet.solana.com";
  console.log(`solana config set --url ${target}`);
  process.exit(0);
}
console.error(`Unknown action: ${action}`); process.exit(1);
