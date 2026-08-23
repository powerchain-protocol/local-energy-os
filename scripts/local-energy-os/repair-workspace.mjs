import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? process.cwd());

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

const rootPackage = path.join(target, "package.json");
if (!fs.existsSync(rootPackage)) {
  console.error(`No package.json found at ${target}`);
  process.exit(1);
}

const pkg = readJson(rootPackage);
pkg.scripts ??= {};

const docsPackagePath = path.join(target, "apps/docs/package.json");
let docsPackageName = "@powerchain/docs-app";
if (fs.existsSync(docsPackagePath)) {
  try {
    docsPackageName = readJson(docsPackagePath).name || docsPackageName;
  } catch {}
}

pkg.scripts["local-energy:doctor"] = "node scripts/local-energy-os/doctor.mjs";
pkg.scripts["local-energy:verify"] = "node scripts/local-energy-os/verify.mjs";
pkg.scripts["local-energy:build"] = "node scripts/local-energy-os/workspace-runner.mjs build";
pkg.scripts["local-energy:typecheck"] = "node scripts/local-energy-os/workspace-runner.mjs typecheck";
pkg.scripts["docs:dev"] ??= `pnpm --filter ${docsPackageName} dev`;
pkg.scripts["docs:build"] ??= `pnpm --filter ${docsPackageName} build`;
pkg.scripts["docs:typecheck"] ??= `pnpm --filter ${docsPackageName} typecheck`;
writeJson(rootPackage, pkg);

const pdaPath = path.join(target, "packages/token/src/solana/pda.ts");
let webcryptoPatched = false;

if (fs.existsSync(pdaPath)) {
  let source = fs.readFileSync(pdaPath, "utf8");

  const exact = 'const digest = await globalThis.crypto.subtle.digest("SHA-256", input);';
  const replacement = [
    "// TS 6 / WebCrypto BufferSource compatibility:",
    "// copy into an ArrayBuffer-backed view rather than passing a",
    "// Uint8Array<ArrayBufferLike> directly to SubtleCrypto.digest.",
    "const digestInput = new ArrayBuffer(input.byteLength);",
    "new Uint8Array(digestInput).set(input);",
    'const digest = await globalThis.crypto.subtle.digest("SHA-256", digestInput);',
  ].join("\n");

  if (source.includes(exact)) {
    source = source.replace(exact, replacement);
    fs.writeFileSync(pdaPath, source);
    webcryptoPatched = true;
  } else if (source.includes("digestInput") && source.includes("subtle.digest")) {
    webcryptoPatched = true;
  }
}

console.log("PowerChain Local Energy OS workspace repair complete.");
console.log(`Root scripts: wired`);
console.log(`Docs package: ${docsPackageName}`);
if (fs.existsSync(pdaPath)) {
  console.log(`WebCrypto TS6 compatibility: ${webcryptoPatched ? "patched/verified" : "manual review required"}`);
} else {
  console.log("WebCrypto TS6 compatibility: packages/token/src/solana/pda.ts not present (skipped)");
}
console.log("");
console.log("Run:");
console.log("  pnpm local-energy:doctor");
console.log("  pnpm local-energy:verify");
console.log("  pnpm local-energy:build");
console.log("  pnpm local-energy:typecheck");
console.log("  pnpm typecheck");
