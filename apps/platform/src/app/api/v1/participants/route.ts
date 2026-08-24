import{NextRequest,NextResponse}from"next/server";import{participants}from"@/data/participants";
export async function GET(req:NextRequest){const role=req.nextUrl.searchParams.get("role");const data=role?participants.filter(x=>x.roles.includes(role as never)):participants;return NextResponse.json({data,meta:{count:data.length}})}
