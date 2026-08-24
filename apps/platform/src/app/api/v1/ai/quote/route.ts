import{NextResponse}from"next/server";import{z}from"zod";import{createUsageQuote}from"@powerchain/credits";
const schema=z.object({estimatedUsd:z.string().regex(/^\d+(\.\d+)?$/).default("0.002"),pwrcUsdPrice:z.string().regex(/^\d+(\.\d+)?$/).default("0.000002")});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:"Invalid quote request",details:parsed.error.flatten()},{status:400});return NextResponse.json({data:createUsageQuote(parsed.data)});}
