import { NextRequest, NextResponse } from "next/server";
import { authenticate, DEMO_ACCOUNTS } from "@/lib/auth/auth";
import { createSession, sessionCookie } from "@/lib/auth/sessions";
import type { AppRole } from "@/types/auth";
const roles: AppRole[] = ["consumer","prosumer","client","company","admin","super-admin"];
export async function GET(){ return NextResponse.json({data:roles.map(role=>({role,email:DEMO_ACCOUNTS[role].email,name:DEMO_ACCOUNTS[role].name}))}); }
export async function POST(request:NextRequest){
  const body: unknown=await request.json().catch(()=>({}));
  const requestedRole=typeof body==="object"&&body!==null&&"role" in body?(body as {role?:unknown}).role:undefined;
  const role:AppRole=typeof requestedRole==="string"&&roles.includes(requestedRole as AppRole)?requestedRole as AppRole:"prosumer";
  const credentials=DEMO_ACCOUNTS[role];
  const user=await authenticate(credentials); const session=createSession(user); const response=NextResponse.json({data:session}); response.headers.set("Set-Cookie",sessionCookie(session.id)); return response;
}
