import { existsSync, readFileSync, readdirSync } from "node:fs";
const required=["apps/web","apps/api","apps/ai-gateway","apps/integration-gateway","apps/websocket-gateway","apps/workers","apps/marketplace","apps/checkout","apps/explorer","packages/widgets","packages/charts","packages/wallets","packages/tokens","packages/transactions","packages/rpc","packages/websocket","packages/pvm","packages/integration"];
const missing=required.filter((path)=>!existsSync(path));
if(missing.length){console.error(`Missing monorepo workspaces: ${missing.join(", ")}`);process.exit(1);}
for(const path of required){if(!existsSync(`${path}/package.json`)) throw new Error(`Missing ${path}/package.json`);}

const workspaces=[".",...readdirSync("apps").map((name)=>`apps/${name}`),...readdirSync("packages").map((name)=>`packages/${name}`)].filter((path)=>existsSync(`${path}/package.json`));
const names=new Map();
for(const path of workspaces){
  const manifest=JSON.parse(readFileSync(`${path}/package.json`,"utf8"));
  if(!manifest.name) throw new Error(`Missing package name: ${path}`);
  if(names.has(manifest.name)) throw new Error(`Duplicate package name ${manifest.name}: ${names.get(manifest.name)} and ${path}`);
  names.set(manifest.name,path);
  if(manifest.version!=="1.0.0") throw new Error(`Workspace ${manifest.name} must use release version 1.0.0`);
  if(path.startsWith("apps/")&&!["apps/docs","apps/storybook"].includes(path)&&!existsSync(`${path}/tsconfig.json`)) throw new Error(`Missing TypeScript configuration: ${path}`);
}
console.log(`PowerChain monorepo structure is valid (${workspaces.length} unique workspaces).`);
