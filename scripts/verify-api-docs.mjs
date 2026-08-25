import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const openapiPath = path.join(root, "packages/api/swagger/openapi.yaml");
const collectionPath = path.join(root, "packages/api/postman/PowerChain-Local-Energy-OS.postman_collection.json");
const environmentPath = path.join(root, "packages/api/postman/PowerChain-Local.postman_environment.json");
const routesManifestPath = path.join(root, "packages/api/api/v1/routes.json");
for (const file of [openapiPath, collectionPath, environmentPath, routesManifestPath]) if (!fs.existsSync(file)) errors.push(`missing:${path.relative(root, file)}`);

if (!errors.length) {
  const openapi = fs.readFileSync(openapiPath, "utf8");
  if (!openapi.startsWith("openapi: 3.1.0")) errors.push("openapi-version:not-3.1.0");
  const routeRoot = path.join(root, "apps/api/app/api/v1");
  const routeFiles = [];
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts") routeFiles.push(full);
    }
  };
  walk(routeRoot);
  const lines = openapi.split(/\r?\n/);
  for (const routeFile of routeFiles) {
    const relative = path.relative(routeRoot, path.dirname(routeFile)).split(path.sep);
    const documented = "/api/v1/" + relative.map(part => part.startsWith("[") && part.endsWith("]") ? `{${part.slice(1, -1)}}` : part).join("/");
    const pathLine = lines.findIndex(line => line === `  ${documented}:`);
    if (pathLine < 0) { errors.push(`undocumented-route:${documented}`); continue; }
    const source = fs.readFileSync(routeFile, "utf8");
    const methods = [...source.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map(match => match[1].toLowerCase());
    const nextPath = lines.slice(pathLine + 1).findIndex(line => /^  \/api\/v1\//.test(line));
    const sectionEnd = nextPath < 0 ? lines.length : pathLine + 1 + nextPath;
    const section = lines.slice(pathLine + 1, sectionEnd);
    for (const method of methods) if (!section.some(line => line === `    ${method}:`)) errors.push(`undocumented-method:${method.toUpperCase()}:${documented}`);
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(routesManifestPath, "utf8"));
    const declared = new Set((manifest.routes ?? []).map((route) => `${route.method}:${route.path}`));
    for (const routeFile of routeFiles) {
      const relative = path.relative(routeRoot, path.dirname(routeFile)).split(path.sep);
      const documented = "/api/v1/" + relative.map(part => part.startsWith("[") && part.endsWith("]") ? `{${part.slice(1, -1)}}` : part).join("/");
      const source = fs.readFileSync(routeFile, "utf8");
      const methods = [...source.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map(match => match[1]);
      for (const method of methods) if (!declared.has(`${method}:${documented}`)) errors.push(`route-manifest-missing:${method}:${documented}`);
    }
  } catch { errors.push("invalid-json:packages/api/api/v1/routes.json"); }
  for (const file of [collectionPath, environmentPath]) {
    try { JSON.parse(fs.readFileSync(file, "utf8")); } catch { errors.push(`invalid-json:${path.relative(root, file)}`); }
  }
}
if (errors.length) { console.error(JSON.stringify({ status: "failed", errors }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ status: "ok", openapi: "3.1.0", canonicalVersion: "1.0.0", methodCoverage: true }, null, 2));
