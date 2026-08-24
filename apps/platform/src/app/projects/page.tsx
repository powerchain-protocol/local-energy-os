"use client";
import {Shell} from "@/components/shell";
import {ProjectCard} from "@/components/crowdfunding/project-card";
import {fundingProjects} from "@/data/projects";
export default function Projects(){return <Shell><div className="content-container space-y-6"><header><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Project registry</p><h1 className="mt-1 text-3xl font-semibold">Projects</h1><p className="mt-2 muted">Explore identified PowerChain energy projects and their financing progress.</p><div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-4 text-sm text-amber-900 dark:text-amber-200"><strong>MVP project catalog.</strong> Project images, financing progress and returns are illustrative until verification and offering documents are published.</div></header><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{fundingProjects.map(x=><ProjectCard key={x.id} project={x}/>)}</div></div></Shell>}
