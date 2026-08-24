import "server-only";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/sessions";
import { SESSION_COOKIE } from "@/lib/security/security";

export async function getCopilotIdentity(){
  const jar=await cookies();
  const session=getSession(jar.get(SESSION_COOKIE)?.value);
  if(session){
    return{
      userId:session.user.id,
      organizationId:session.user.organizationId,
      role:session.user.role,
      authenticated:true,
    };
  }
  if(process.env.NODE_ENV!=="production"){
    return{userId:"user_demo",organizationId:"org_powerchain_demo",role:"demo",authenticated:false};
  }
  return null;
}
