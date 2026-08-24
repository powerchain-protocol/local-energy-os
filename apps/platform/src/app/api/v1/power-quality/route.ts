import{NextResponse}from"next/server";
export async function GET(){return NextResponse.json({data:{frequencyHz:50.02,voltageV:231.7,thdPercent:2.8,powerFactor:.96,phaseImbalancePercent:.7,outages24h:1,status:"stable"},meta:{source:"edge-telemetry",timestamp:new Date().toISOString()}})}
