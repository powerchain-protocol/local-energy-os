import { Shell } from "@/components/shell";
import { StandardsPortfolio } from "@/components/standards";

export const metadata = { title: "PTSP 5.0 | PowerChain", description: "PowerChain Technical Standards Program portfolio, governance and conformance profiles." };

export default function StandardsPage() {
  return <Shell><div className="content-container space-y-7"><header className="rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-[#061b17] via-[#0f5a46] to-[#168060] p-6 text-white shadow-[0_24px_70px_-30px_rgba(15,90,70,.8)] sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">PowerChain Foundation · Foundational Program</p><h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.04em] sm:text-5xl">PowerChain Technical Standards Program</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/85 sm:text-base">A professional standards portfolio governing reference architecture, shared semantics, interoperable protocols, engineering assets, compatibility, publication and certification across the PowerChain ecosystem.</p></header><StandardsPortfolio /></div></Shell>;
}
