import fs from "node:fs";

const required = [
  "docs/README.md",
  "docs/programs/README.md",
  "docs/programs/SECURITY.md",
  "docs/programs/DEPLOYMENT.md",
  "docs/programs/TESTING.md",
  "docs/architecture/PROOF_OF_ENERGY.md",
  "docs/architecture/INTEGRATION-FABRIC.md",
  "docs/programs/OVERVIEW.md",
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing documentation artifact: ${file}`);
  const content = fs.readFileSync(file, "utf8").trim();
  if (content.length < 80) throw new Error(`Documentation artifact is unexpectedly short: ${file}`);
}

console.log(`Documentation checks passed (${required.length} artifacts)`);
