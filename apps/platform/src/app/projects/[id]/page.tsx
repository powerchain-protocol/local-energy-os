import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { fundingProjects } from "@/data/projects";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() { return fundingProjects.map((project) => ({ id: project.slug })); }
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const project = fundingProjects.find((item) => item.slug === id); if (!project) notFound();
  const pct = Math.round((project.raised / project.goal) * 100);
  return <Shell><div className="content-container"><article className="panel overflow-hidden"><div className="project-hero p-6 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em]">{project.id}</p><h1 className="mt-3 max-w-3xl text-3xl font-black sm:text-5xl">{project.title}</h1><p className="mt-4 max-w-2xl text-white/75">{project.summary}</p></div><div className="grid gap-8 p-6 lg:grid-cols-[1fr_22rem] lg:p-10"><section><h2 className="text-xl font-bold">Project overview</h2><p className="mt-3 leading-7 muted">This verified project combines transparent milestone funding, digital-twin monitoring and on-chain impact records.</p><div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Backers" value={project.backers.toLocaleString()}/><Stat label="Days left" value={String(project.daysLeft)}/><Stat label="Funded" value={`${pct}%`}/></div></section><aside className="rounded-2xl border border-[var(--border)] p-5"><span className="text-sm muted">Raised</span><strong className="mt-1 block text-2xl">€{project.raised.toLocaleString()}</strong><p className="mt-1 text-sm muted">of €{project.goal.toLocaleString()}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full bg-emerald-600" style={{width:`${pct}%`}}/></div><ButtonLink href={`/checkout?project=${encodeURIComponent(project.slug)}`} className="mt-5 w-full">Back this project</ButtonLink></aside></div></article></div></Shell>;
}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs muted">{label}</span><strong className="mt-1 block text-lg">{value}</strong></div>}
