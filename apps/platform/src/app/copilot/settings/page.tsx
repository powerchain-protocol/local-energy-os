import Link from "next/link";
import { Bot, Database, MemoryStick, Plug, Settings2 } from "lucide-react";
import { Shell } from "@/components/shell";
const settings=[
  ["Models","Select hosted or organization language models.","/dashboard/ai/models",Bot],
  ["Providers","Configure server-side AI providers and local adapters.","/dashboard/ai/providers",Plug],
  ["Memory","Configure conversation and workspace memory policy.","/dashboard/ai/memory",Database],
  ["LoRA adapters","Manage specialized model adapters.","/dashboard/ai/lora",MemoryStick],
  ["Advanced settings","Generation, usage and billing configuration.","/dashboard/ai/settings",Settings2],
] as const;
export default function CopilotSettingsPage(){return <Shell><div className="content-container space-y-6"><header className="copilot-product-hero"><span className="eyebrow">COPILOT SYSTEM CONFIGURATION</span><h1>Configure the engine behind the operator interface.</h1><p>Models, providers, memory and adapters are implementation settings behind PowerChain Copilot. Operators use Copilot; administrators configure the underlying AI platform here.</p></header><section className="copilot-registry-grid">{settings.map(([title,description,href,Icon])=><Link key={href} href={href} className="copilot-registry-card"><span>CONFIGURATION</span><Icon className="mt-3 h-5 w-5 text-emerald-700"/><h3>{title}</h3><p>{description}</p></Link>)}</section></div></Shell>}
