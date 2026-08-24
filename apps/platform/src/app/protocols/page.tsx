import {Shell} from "@/components/shell";
const protocols=[
{name:"Proof of Energy",status:"Available",detail:"Trusted meter-to-token issuance and settlement invariant."},
{name:"Solana Pay",status:"Beta",detail:"Wallet-authorized renewable purchases and checkout references."},
{name:"Solana Blinks",status:"Beta",detail:"Validated renewable project and marketplace actions."},
{name:"Renewable SVM",status:"Beta",detail:"Tokenized renewable assets and certificates on Solana SVM."},
{name:"Zero-Knowledge Proofs",status:"Research",detail:"Selective disclosure for meter, identity and settlement claims."},
{name:"DePIN + LoRaWAN",status:"Available",detail:"Gateway-normalized telemetry and oracle verification."},
];
export default function ProtocolsPage(){return <Shell><div className="content-container space-y-5"><section className="rounded-[26px] bg-gradient-to-br from-[#073f31] to-[#0d674f] p-7 text-white"><p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-200">PowerChain Protocol Layer</p><h1 className="mt-2 text-3xl font-semibold">Protocols and verification</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Standards-aligned building blocks for payments, private verification, tokenized renewable assets, DePIN telemetry and blockchain settlement.</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{protocols.map((p)=><article key={p.name} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-semibold">{p.name}</h2><span className="text-xs text-emerald-700">{p.status}</span></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{p.detail}</p></article>)}</section></div></Shell>}
