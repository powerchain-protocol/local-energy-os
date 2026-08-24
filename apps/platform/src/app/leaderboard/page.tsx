import { ArrowUpRight, Award, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { DigitalEnergyCommandCenter } from "@/components/digital-energy";

export default function Page(){return <Shell><div className="content-container space-y-6">
  <header className="rounded-[24px] border border-emerald-900 bg-gradient-to-br from-[#07110c] to-emerald-950 p-7 text-white shadow-[0_22px_60px_rgba(6,78,59,.2)]">
    <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-emerald-300">PowerChain Digital Energy OS</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">Reward Epochs & Verified Contribution</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/75">Rewards remain economically separate from physical energy. Verified Wh can establish eligibility, but no implicit conversion such as 1 kWh = 1 PWRC is permitted.</p>
  </header>
  <DigitalEnergyCommandCenter compact/>
  <section className="grid gap-4 md:grid-cols-2">
    <article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">Reward policy</span><h2>Explicit epoch configuration</h2></div><Award className="h-5 w-5 text-emerald-700"/></div><p className="ai-priority">The Digital Energy overview reports the configured epoch ID, window, eligible verified Wh and state. PWRC reward amounts remain unavailable until an explicit reward-conversion policy is configured.</p><Link className="text-link" href="/digital-energy">Open Digital Energy OS <ArrowUpRight/></Link></article>
    <article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">Safety boundary</span><h2>Energy ≠ rewards</h2></div><ShieldCheck className="h-5 w-5 text-emerald-700"/></div><p className="ai-priority">PWRC is native to Solana and wPWRC is its 1:1 bridge-backed Sui representation. Neither asset is a unit of electricity, and reward settlement cannot alter verified physical-energy backing.</p><Link className="text-link" href="/energy-rwa">Review Energy RWA <ArrowUpRight/></Link></article>
  </section>
</div></Shell>}
