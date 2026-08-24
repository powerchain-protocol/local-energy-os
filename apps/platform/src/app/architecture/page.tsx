import { Shell } from "@/components/shell";
import { ArchitectureFramework } from "@/components/architecture";

export const metadata = { title: "PPA 3.0 Architecture | PowerChain", description: "PowerChain Platform Architecture reference framework and standards catalog." };

export default function ArchitecturePage() {
  return <Shell><div className="content-container space-y-7"><header className="rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-[#071f1a] via-[#0f5a46] to-[#16765c] p-6 text-white shadow-[0_24px_70px_-30px_rgba(15,90,70,.8)] sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">PowerChain Foundation · PPA 3.0 Draft</p><h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.04em] sm:text-5xl">Digital Energy Platform Reference Architecture</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/85 sm:text-base">A contract-driven, implementation-independent architecture defining the common semantics, protocols, runtime behavior, deployment profiles and conformance rules for interoperable digital energy platforms.</p></header><ArchitectureFramework /></div></Shell>;
}
