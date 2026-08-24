import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../..");
const failures=[];
if(fs.existsSync(path.join(root,"middleware.ts"))) failures.push("Deprecated root middleware.ts exists");
if(!fs.existsSync(path.join(root,"apps/platform/proxy.ts"))) failures.push("Platform proxy.ts is missing");
if(fs.existsSync(path.join(root,"apps/platform/src/pages"))) failures.push("apps/platform/src/pages must not exist; use apps/platform/src/app only");
const required=["apps/platform/src/app/layout.tsx","apps/platform/src/app/providers.tsx","apps/platform/src/app/page.tsx","apps/platform/src/app/analytics/page.tsx","apps/platform/src/app/auth/signin/page.tsx","apps/platform/src/app/auth/signup/page.tsx","apps/platform/src/app/admin/users/page.tsx","apps/platform/src/app/api/v1/status/route.ts","apps/platform/src/workspaces/admin/components/user-management.tsx","apps/platform/src/components/wallet/wallet-connect-modal.tsx","apps/platform/src/lib/observability/tracing.ts","packages/configuration/src/config/routes.ts","packages/shared/src/utils/helpers.ts","packages/shared/src/utils/assets.ts","packages/shared/src/utils/errors.ts","packages/types/src/types/ai/ai.ts"];
for(const file of required) if(!fs.existsSync(path.join(root,file))) failures.push(`Missing ${file}`);
const sourceFiles=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);entry.isDirectory()?walk(file):sourceFiles.push(file)}}
walk(path.join(root,"apps/platform/src"));
for(const file of sourceFiles.filter(f=>/\.[jt]sx?$/.test(f))){const text=fs.readFileSync(file,"utf8");if(text.includes('next/router')) failures.push(`Legacy next/router import: ${path.relative(root,file)}`);}
const wallet=fs.readFileSync(path.join(root,"apps/platform/src/components/wallet/wallet-connect-modal.tsx"),"utf8");
if(!wallet.includes("@radix-ui/react-dialog")) failures.push("Wallet modal must use the approved Radix Dialog primitive");
if(failures.length){console.error(failures.join("\n"));process.exit(1);}console.log("App Router preflight passed");
