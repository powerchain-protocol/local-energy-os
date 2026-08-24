import { fundingProjects } from "@/data/projects";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const project=fundingProjects.find((item)=>item.id.toLowerCase()===id.toLowerCase()||item.slug===id);if(!project)return Response.json({error:"Project not found"},{status:404});return Response.json({data:project,meta:{mvp:true}})}
