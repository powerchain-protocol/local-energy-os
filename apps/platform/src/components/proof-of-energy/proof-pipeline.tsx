import { CheckCircledIcon, CubeIcon, LightningBoltIcon, LockClosedIcon, RocketIcon, TokensIcon } from "@radix-ui/react-icons";

const steps = [
  ["Renewable Generation", "Physical output from a registered renewable asset"],
  ["Smart Meter", "Signed and sequence-controlled measurement"],
  ["IoT Gateway", "Normalized, encrypted, replay-safe telemetry"],
  ["Encrypted Data", "Authenticated envelope with protected provenance"],
  ["Oracle Consensus", "Independent DePIN validator attestation"],
  ["Blockchain Proof", "Compact immutable proof and issuance reference"],
  ["Energy Token", "Single-issuance kWh or MWh representation"],
  ["Marketplace", "Grid-aware reservation and delivery contract"],
  ["Settlement", "Payment, retirement, certificate and receipt"],
] as const;

export function ProofPipeline() {
  const icons = [LightningBoltIcon, CheckCircledIcon, CubeIcon, LockClosedIcon, CheckCircledIcon, CubeIcon, TokensIcon, RocketIcon, CheckCircledIcon];
  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-800/30 bg-[linear-gradient(145deg,#052e25,#0b4f3d_56%,#07372c)] p-5 text-white shadow-[0_24px_70px_rgba(5,46,37,.24)] sm:p-7">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-200">Canonical settlement pipeline</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Proof of Energy™</h2></div>
        <p className="max-w-xl text-sm leading-6 text-emerald-100/75">Every tokenized unit remains traceable to one trusted measurement, one oracle decision, and one settlement lifecycle.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        {steps.map(([title, detail], index) => { const Icon = icons[index]; return (
          <article key={title} className="group relative min-h-36 rounded-2xl border border-white/12 bg-white/[.075] p-4 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[.11]">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-900 shadow-sm"><Icon className="h-4 w-4" /></div>
            <p className="mt-4 text-sm font-semibold leading-snug">{title}</p><p className="mt-2 text-[11px] leading-5 text-emerald-100/65">{detail}</p>
            {index < steps.length - 1 && <span aria-hidden className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/15 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 xl:block">→</span>}
          </article>
        ); })}
      </div>
    </section>
  );
}
