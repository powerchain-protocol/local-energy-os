import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("engineering framework exposes coordinated programs and route", () => {
  const data = fs.readFileSync("packages/data/src/application/catalog/framework/index.ts", "utf8");
  const routes = fs.readFileSync("packages/configuration/src/config/routes.ts", "utf8");
  assert.match(data, /PowerChain Architecture Framework/);
  assert.match(data, /PowerChain Protocol Standards/);
  assert.match(data, /PowerChain Engineering Program/);
  assert.match(data, /Platform Reference Implementation/);
  assert.match(routes, /framework: "\/framework"/);
});

test("constitutional blueprint and knowledge graph are published", () => {
  assert.equal(fs.existsSync("docs/PFB/CONSTITUTION.md"), true);
  const graph = JSON.parse(fs.readFileSync("packages/engineering/knowledge-graph/framework.json", "utf8"));
  assert.equal(graph.nodes[0].type, "principle");
  assert.equal(graph.nodes.at(-1).type, "profile");
});
