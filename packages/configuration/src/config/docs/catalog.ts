export interface DocumentationEntry{id:string;title:string;category:"architecture"|"api"|"ai"|"tokens"|"legal"|"operations";href:string;description:string;}
export const DOCUMENTATION_CATALOG:DocumentationEntry[]=[
{id:"docs-platform",title:"Platform documentation",category:"architecture",href:"/docs/architecture",description:"Reference architecture, deployment and operations guidance."},
{id:"docs-api",title:"API and Swagger",category:"api",href:"/docs/api",description:"Versioned API contracts and machine-readable OpenAPI."},
{id:"docs-ai",title:"AI agents and skills",category:"ai",href:"/docs/ai",description:"GRIDLLM, LoRA adapters, memory and agent configuration."},
{id:"docs-tokens",title:"Tokens and bridges",category:"tokens",href:"/docs/tokens",description:"PWRC, wPWRC, CRT and bridge supply invariants."},
{id:"docs-legal",title:"Legal and policies",category:"legal",href:"/docs/legal",description:"Privacy, platform terms and cookie policy."},
{id:"docs-proof",title:"Proof of Energy",category:"operations",href:"/proof-of-energy",description:"Trusted energy measurement, verification, minting and settlement."},
];
