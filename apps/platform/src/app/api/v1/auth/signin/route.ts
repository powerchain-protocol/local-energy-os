import { authenticate } from "@/lib/auth/auth";
import { createSession, sessionCookie } from "@/lib/auth/sessions";
import { securityHeaders } from "@/lib/security/security";
export async function POST(request: Request) { try { const body=await request.json(); const user=await authenticate(body); const session=createSession(user); return Response.json({ok:true,data:{user,expiresAt:session.expiresAt}},{status:200,headers:{...securityHeaders,"set-cookie":sessionCookie(session.id)}}); } catch(cause){ return Response.json({ok:false,error:cause instanceof Error?cause.message:"Invalid credentials"},{status:401,headers:securityHeaders}); } }
