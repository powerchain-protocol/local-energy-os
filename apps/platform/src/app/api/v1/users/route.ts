import { NextRequest, NextResponse } from "next/server";
import type { AppRole } from "@/types/auth";
const users=[
{id:"usr_demo_1",name:"Ada Green",email:"ada@powerchain.energy",role:"super-admin",status:"active",tier:"enterprise"},
{id:"usr_demo_2",name:"Leo Watt",email:"leo@powerchain.energy",role:"admin",status:"active",tier:"business"},
{id:"usr_demo_3",name:"Mira Solar",email:"mira@powerchain.energy",role:"prosumer",status:"active",tier:"prosumer"},
{id:"usr_demo_4",name:"Noah Grid",email:"noah@client.energy",role:"client",status:"invited",tier:"starter"}
];
export async function GET(){return NextResponse.json({data:users,total:users.length});}
export async function POST(request:NextRequest){const body=await request.json();if(!body.email||!body.name)return NextResponse.json({error:"Name and email are required"},{status:400});const user={id:`usr_${crypto.randomUUID()}`,name:body.name,email:body.email,role:(body.role??"consumer") as AppRole,status:"invited",tier:body.tier??"starter"};return NextResponse.json({data:user},{status:201});}
