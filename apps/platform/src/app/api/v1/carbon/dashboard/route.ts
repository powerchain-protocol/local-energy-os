import{NextResponse}from"next/server";import{carbonDashboard,carbonCredits,carbonProjects}from"@/data/carbon";
export async function GET(){return NextResponse.json({data:{metrics:carbonDashboard,projects:carbonProjects,credits:carbonCredits},meta:{generatedAt:new Date().toISOString(),source:"verified-demo"}})}
