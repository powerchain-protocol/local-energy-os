import{NextResponse}from"next/server";import{exchangeTrades}from"@/data/exchange";
export async function GET(){return NextResponse.json({data:exchangeTrades,meta:{count:exchangeTrades.length}})}
