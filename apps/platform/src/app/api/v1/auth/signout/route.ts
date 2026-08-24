import { expiredSessionCookie } from "@/lib/auth/sessions"; import { securityHeaders } from "@/lib/security/security";
export async function POST(){return Response.json({ok:true},{headers:{...securityHeaders,"set-cookie":expiredSessionCookie()}})}
