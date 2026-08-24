import { Shell } from "@/components/shell";
import { certificationPrograms, tokenizedCertificates } from "@/data/certification";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export default function CertificationPage() {
  return (
    <Shell>
      <div className="content-container space-y-5">
        <section className="rounded-[26px] bg-gradient-to-br from-[#073f31] via-[#0b5844] to-[#083d31] p-6 text-white shadow-[0_22px_70px_rgba(7,63,49,.22)] sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-200">PowerChain Trust & Conformance</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Certification Center</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/80">Issue, verify, tokenize and retire renewable certificates using Proof of Energy, oracle consensus and auditable registry controls.</p>
            </div>
            <div className="flex flex-wrap gap-3"><ButtonLink href="/docs/certification" variant="white">Requirements</ButtonLink><ButtonLink href="/carbon" variant="framed" className="border-white/30 text-white hover:bg-white/10">Carbon Exchange</ButtonLink></div>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {certificationPrograms.map((program) => <article key={program.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_34px_rgba(15,23,42,.05)]"><div className="flex items-center justify-between gap-3"><Badge variant="info">{program.kind}</Badge><span className="text-xs text-[var(--muted)]">{program.status}</span></div><h2 className="mt-4 text-lg font-semibold">{program.name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{program.standard} · {program.authority}</p><ul className="mt-4 space-y-2 text-sm">{program.requirements.slice(0, 3).map((requirement) => <li key={requirement} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{requirement}</span></li>)}</ul></article>)}
        </section>
        <section className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">Registry</p><h2 className="mt-1 text-xl font-semibold">Tokenized certificates</h2></div><ButtonLink href="/tokens/crt" variant="framed">View token details</ButtonLink></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-[var(--border)] text-[var(--muted)]"><th className="py-3">Certificate</th><th>Asset</th><th>Quantity</th><th>Status</th><th>Network</th></tr></thead><tbody>{tokenizedCertificates.map((certificate) => <tr key={certificate.id} className="border-b border-[var(--border)] last:border-0"><td className="py-4 font-medium">{certificate.id}</td><td>{certificate.assetId}</td><td>{certificate.quantity} {certificate.unit}</td><td><Badge variant="success">{certificate.status}</Badge></td><td>{certificate.blockchain ?? "off-chain"}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </Shell>
  );
}
