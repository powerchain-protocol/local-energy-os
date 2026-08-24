import{NextResponse}from"next/server";import{getAIConfig}from"@/services/ai/powerchain-ai";export async function GET(){return NextResponse.json({data:getAIConfig()})}
