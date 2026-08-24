const production = process.env.NODE_ENV === "production";
const requiredInProduction = ["DATABASE_URL"];
const missing = requiredInProduction.filter((key) => !process.env[key]);

if (production && missing.length) {
  console.error(`Missing production environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const urlKeys = [
  "NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL",
  "NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL",
  "NEXT_PUBLIC_SUI_DEVNET_RPC_URL",
  "NEXT_PUBLIC_SUI_TESTNET_RPC_URL",
  "NEXT_PUBLIC_SUI_MAINNET_RPC_URL",
  "HELIUS_DEVNET_RPC_URL",
  "HELIUS_MAINNET_RPC_URL"
];
for (const key of urlKeys) {
  const value = process.env[key];
  if (value && !value.startsWith("https://")) {
    console.error(`${key} must use HTTPS`);
    process.exit(1);
  }
}

if (missing.length) console.warn(`Development fallback active; unset: ${missing.join(", ")}`);
console.log("Environment configuration check passed.");
