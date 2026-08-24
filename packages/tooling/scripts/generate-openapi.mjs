import fs from "node:fs";
const source=fs.readFileSync("docs/api/swagger.yaml","utf8");
if(!source.includes("/chat:"))throw new Error("Chat endpoint missing from OpenAPI");
if(!source.includes("/digital-energy/overview:"))throw new Error("Digital Energy endpoint missing from OpenAPI");
fs.copyFileSync("docs/api/swagger.yaml","apps/platform/public/openapi.yaml");
console.log("OpenAPI copied to apps/platform/public/openapi.yaml");
