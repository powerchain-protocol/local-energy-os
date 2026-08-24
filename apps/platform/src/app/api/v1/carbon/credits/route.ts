import{NextRequest,NextResponse}from"next/server";import{carbonCredits}from"@/data/carbon";
export async function GET(){return NextResponse.json({data:carbonCredits})}
export async function POST(req:NextRequest){const body=await req.json().catch(()=>null);if(!body?.projectId||!Number.isFinite(Number(body?.tonnes))||Number(body.tonnes)<=0)return NextResponse.json({error:"projectId and a positive tonnes value are required"},{status:400});return NextResponse.json({data:{id:`CRT-${Date.now()}`,status:"pending_verification",...body}},{status:202})}
