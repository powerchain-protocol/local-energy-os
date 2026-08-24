import{NextResponse}from"next/server";import{feeSchedules}from"@/data/ecosystem";export async function GET(){return NextResponse.json({data:feeSchedules})}
