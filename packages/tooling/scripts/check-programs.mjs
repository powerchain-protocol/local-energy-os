import fs from "node:fs";

const modules = [
  "config.rs",
  "depin.rs",
  "digital_twin.rs",
  "errors.rs",
  "events.rs",
  "exchange.rs",
  "governance.rs",
  "gridllm.rs",
  "invariants.rs",
  "metering.rs",
  "proof_of_energy.rs",
  "registry.rs",
  "smart_grid.rs",
  "tokens.rs",
  "treasury.rs",
];

const domains = [
  "meter-registry",
  "oracle-registry",
  "proof-of-energy",
  "energy-token",
  "marketplace",
  "escrow",
  "treasury",
  "governance",
  "pwrc-bridge",
];

for (const file of modules) {
  const path = `packages/programs/anchor/src/${file}`;
  if (!fs.existsSync(path)) throw new Error(`Missing ${path}`);
}

for (const domain of domains) {
  for (const file of ["README.md", "src/lib.rs"]) {
    const path = `packages/programs/anchor/${domain}/${file}`;
    if (!fs.existsSync(path)) throw new Error(`Missing ${path}`);
  }
}

const lib = fs.readFileSync("packages/programs/anchor/src/lib.rs", "utf8");
for (const module of ["proof_of_energy", "digital_twin", "gridllm", "errors", "events", "invariants"]) {
  if (!lib.includes(`pub mod ${module};`)) throw new Error(`packages/programs/anchor/src/lib.rs does not export ${module}`);
}

const invariants = fs.readFileSync("packages/programs/anchor/src/invariants.rs", "utf8");
if (!invariants.includes("enforce_supply_backing")) throw new Error("Missing PWRC supply-backing invariant");
if (!invariants.includes("mintable_energy")) throw new Error("Missing mintable-energy invariant");

console.log(`Program checks passed (${modules.length} modules, ${domains.length} domains)`);
