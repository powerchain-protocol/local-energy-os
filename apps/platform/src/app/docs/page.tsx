import { Bot, BookOpen, Boxes, Coins, FileCode2, Scale, ShieldCheck, Workflow } from "lucide-react";
import { Shell } from "@/components/shell";
import { DocCard, DocsHero } from "@/components/docs";
const sections=[
  ["Platform documentation","Architecture, operations, configuration and deployment references.","/docs/architecture",<BookOpen key="a"/>,"Reference"],
  ["API & Swagger","Versioned REST endpoints, OpenAPI contracts and integration examples.","/docs/api",<FileCode2 key="b"/>,"OpenAPI"],
  ["AI & agents","GRIDLLM, renewable agents, skills, memory and model configuration.","/docs/ai",<Bot key="c"/>,"AI"],
  ["Tokens & bridges","PWRC, wPWRC, CRT and cross-chain supply invariants.","/docs/tokens",<Coins key="d"/>,"Web3"],
  ["Programs & contracts","Solana programs, marketplace contracts and proof-of-energy logic.","/docs/architecture",<Boxes key="e"/>,"Engineering"],
  ["Workflows","Proof of Energy, tokenization, settlement and operational lifecycle.","/proof-of-energy",<Workflow key="f"/>,"Operations"],
  ["Security & trust","Identity, authorization, audit, secrets and device trust guidance.","/architecture",<ShieldCheck key="g"/>,"Security"],
  ["Legal & policies","Privacy, platform terms and cookie policies.","/docs/legal",<Scale key="h"/>,"Legal"],
] as const;
export default function Documentation(){return <Shell><div className="space-y-6"><DocsHero/><section><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">References</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Documentation library</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{sections.map(([t,d,h,i,b])=><DocCard key={t} title={t} description={d} href={h} icon={i} badge={b}/>)}</div></section></div></Shell>}
