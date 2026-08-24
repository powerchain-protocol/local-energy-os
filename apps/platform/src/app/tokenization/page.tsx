import { Shell } from "@/components/shell";
const assets = [
  ["PWRC", "Governance, staking, fees and incentives"],
  ["wPWRC", "Sui bridge settlement backed by locked PWRC"],
  ["kWh Token", "Verified retail renewable electricity"],
  ["MWh Token", "Wholesale renewable electricity"],
  ["REC Token", "Renewable energy certificates"],
  ["CRT Token", "Verified carbon credits"],
  ["BESS Token", "Storage capacity and reserve"],
];
export default function Page() {
  return (
    <Shell>
      <div className="content-container space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
            Financial & Token Layer
          </p>
          <h1 className="mt-1 text-3xl font-black">Tokenization Platform</h1>
          <p className="mt-2 max-w-3xl muted">
            Issue, transfer, settle and retire digital energy assets with a
            traceable link to trusted physical measurements.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map(([name, description]) => (
            <article key={name} className="surface-card p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-950 font-black text-white">
                {name.slice(0, 2)}
              </div>
              <h2 className="mt-4 text-lg font-black">{name}</h2>
              <p className="mt-1 text-sm muted">{description}</p>
              <div className="mt-5 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-3/4 rounded-full bg-emerald-600" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </Shell>
  );
}
