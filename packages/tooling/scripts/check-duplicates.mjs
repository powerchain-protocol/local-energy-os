import { existsSync } from "node:fs";

const forbidden = [
  "src",
  "public",
  "database",
  "prisma",
  "programs",
  "contracts",
  "engineering",
  "integration",
  "k8s",
  "terraform",
  "scripts",
  "tests",
  "Dockerfile",
  "docker-compose.yml",
  "Anchor.toml",
];

const duplicates = forbidden.filter(existsSync);
if (duplicates.length) {
  console.error(`Deprecated root copies detected: ${duplicates.join(", ")}`);
  process.exit(1);
}
console.log("Canonical ownership check passed: no deprecated root copies.");
