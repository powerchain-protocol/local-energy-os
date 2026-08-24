import{NextResponse}from"next/server";import{POWERCHAIN_AI_MODELS}from"@/config/ai/models";export async function GET(){return NextResponse.json({data:POWERCHAIN_AI_MODELS})}
