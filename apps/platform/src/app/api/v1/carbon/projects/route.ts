import{NextResponse}from"next/server";import{carbonProjects}from"@/data/carbon";
export async function GET(){return NextResponse.json({data:carbonProjects})}
