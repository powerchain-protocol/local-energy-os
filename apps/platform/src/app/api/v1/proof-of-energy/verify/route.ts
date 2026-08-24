import{NextResponse}from"next/server";import{buildProofRecord}from"@/lib/proof-of-energy";import type{EnergyMeasurement}from"@/types/proof-of-energy";
export async function POST(req:Request){const m=await req.json() as EnergyMeasurement;const record=buildProofRecord(m);return NextResponse.json(record,{status:record.status==="rejected"?422:201})}
