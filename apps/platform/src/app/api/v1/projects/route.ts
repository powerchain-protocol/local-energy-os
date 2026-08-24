import { fundingProjects } from "@/data/projects";
export async function GET(){return Response.json({data:fundingProjects,meta:{count:fundingProjects.length,source:"PowerChain project registry",mvp:true}},{headers:{"cache-control":"public, max-age=60, stale-while-revalidate=300"}})}
