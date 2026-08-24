import fs from "node:fs";

const required = [
  "docs/PEF/README.md",
  "docs/PFB/CONSTITUTION.md",
  "docs/standards/catalogs/paf/catalog.json",
  "docs/standards/catalogs/pps/catalog.json",
  "packages/engineering/pep/catalog.json",
  "packages/engineering/knowledge-graph/framework.json",
  "apps/platform/src/app/framework/page.tsx",
  "apps/platform/src/app/api/v1/framework/catalog/route.ts",
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing framework artifact: ${file}`);
}
const graph = JSON.parse(fs.readFileSync("packages/engineering/knowledge-graph/framework.json", "utf8"));
if (!Array.isArray(graph.nodes) || graph.nodes.length < 8) throw new Error("Framework graph is incomplete");
if (!Array.isArray(graph.edges) || graph.edges.length < 7) throw new Error("Framework traceability is incomplete");
console.log(`PowerChain Engineering Framework validated: ${graph.nodes.length} nodes, ${graph.edges.length} edges.`);
