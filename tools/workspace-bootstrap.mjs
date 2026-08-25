import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const created = [];
const skipped = [];

function ensure(relativePath, content) {
  const absolute = path.join(root, relativePath);
  if (fs.existsSync(absolute)) {
    skipped.push(relativePath);
    return;
  }
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${content.trimEnd()}\n`, "utf8");
  created.push(relativePath);
}

const envTemplate = `# PowerChain Local Energy OS v1.0.0 — local development template
POWERCHAIN_VERSION=1.0.0
POWERCHAIN_ENVIRONMENT=development
POWERCHAIN_OPERATING_MODE=SIMULATION
POWERCHAIN_DATA_MODE=mock
POWERCHAIN_WRITE_MODE=simulated
POWERCHAIN_NETWORK=devnet
POWERCHAIN_ORIGIN=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_OPERATING_MODE=SIMULATION
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_SOLANA_NETWORK=devnet

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/powerchain?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/powerchain?schema=public
SHADOW_DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
AUTH_TRUSTED_ORIGINS=http://localhost:3000

SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=
HELIUS_API_KEY=
PWRC_MINT=PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
PWRC_TOKEN_PROGRAM=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
PWRC_DECIMALS=9
PWRC_BRIDGE_ENABLED=false

SUI_NETWORK=testnet
SUI_RPC_URL=
WPWRC_COIN_TYPE=
SUI_POWERCHAIN_PACKAGE_ID=

ENERGY_RWA_ENABLED=true
ENERGY_RWA_SOLANA_ENABLED=true
ENERGY_RWA_SUI_ENABLED=false
ENERGY_RWA_MIN_QUALITY_SCORE=0.90

REDIS_URL=redis://localhost:6379
SAP_ENABLED=false
X402_ENABLED=false
CCTP_ENABLED=false
PYTH_ENABLED=true
CHAINLINK_ENABLED=false

FEATURE_LOCAL_MARKET=true
FEATURE_FLEXIBILITY=true
FEATURE_DEPIN=true
FEATURE_EV_CHARGING=true
FEATURE_POWER_PLANTS=true
FEATURE_WIND=true
FEATURE_SUPPLY_CHAIN=true
FEATURE_SAAS=true

POWERCHAIN_TRUST_DEV_HEADERS=true
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID=
`;

ensure(".env.local.example", envTemplate);
ensure(".env.example", envTemplate);
ensure(".vscode/settings.json", JSON.stringify({
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "files.eol": "\\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/.turbo": true,
    "**/dist": true,
    "**/target": true,
    "**/packages/database/src/generated/prisma": true,
    "pnpm-lock.yaml": true
  }
}, null, 2));
ensure(".vscode/extensions.json", JSON.stringify({ recommendations: [
  "Prisma.prisma",
  "bradlc.vscode-tailwindcss",
  "ms-azuretools.vscode-docker",
  "redhat.vscode-yaml",
  "eamodio.gitlens",
  "github.copilot",
  "github.copilot-chat",
  "editorconfig.editorconfig"
]}, null, 2));
ensure(".vscode/tasks.json", JSON.stringify({
  version: "2.0.0",
  tasks: [
    { label: "PowerChain: Verify", type: "shell", command: "pnpm local-energy:verify", group: "test", problemMatcher: ["$tsc"] },
    { label: "PowerChain: Typecheck", type: "shell", command: "pnpm typecheck", problemMatcher: ["$tsc"] },
    { label: "PowerChain: Build Apps", type: "shell", command: "pnpm build:apps", problemMatcher: [] },
    { label: "Infrastructure: Doctor", type: "shell", command: "pnpm infra:doctor", problemMatcher: [] },
    { label: "Infrastructure: Up", type: "shell", command: "pnpm infra:up", problemMatcher: [] },
    { label: "Prisma: Doctor", type: "shell", command: "pnpm prisma:doctor", problemMatcher: [] },
    { label: "Prisma: Validate + Generate", type: "shell", command: "pnpm prisma:validate && pnpm prisma:generate", problemMatcher: [] },
    { label: "Prisma: Migrate Dev", type: "shell", command: "pnpm prisma:migrate:dev", problemMatcher: [] }
  ]
}, null, 2));
ensure(".windsurf/rules/powerchain.md", `# PowerChain repository rules\n\n- Canonical version is 1.0.0.\n- Physical energy is authoritative; blockchain represents settlement/provenance.\n- Use bigint Wh internally. Never coerce authoritative Wh balances through JavaScript Number.\n- PWRC is native on Solana; wPWRC is the 1:1 Sui bridge representation.\n- kWh/MWh Energy RWA supply may never exceed verified physical energy backing.\n- Use /api/v1 for canonical application APIs.\n- Do not fabricate telemetry, balances, prices, receipts or settlement state.\n- Keep the desktop sidebar full-height and do not add an application footer.\n- Financial/external actions require policy and explicit approval where configured.\n`);
ensure(".github/copilot-instructions.md", `# PowerChain Copilot instructions\n\nUse docs/ai/AGENTS.md and the canonical PowerChain v1.0.0 architecture. Preserve bigint Wh accounting, tenant isolation, idempotent economic mutations, explicit runtime modes, and PWRC/wPWRC/Energy RWA separation. Never invent live operational data.\n`);

console.log(JSON.stringify({ status: "ok", created, skipped }, null, 2));
