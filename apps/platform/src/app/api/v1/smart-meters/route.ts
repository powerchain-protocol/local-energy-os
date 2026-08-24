import{NextRequest,NextResponse}from"next/server";
const meters=[{id:"SM-HE-10021",site:"Harbor Microgrid",status:"online",network:"lorawan",firmware:"3.8.1",health:96},{id:"SM-ES-23004",site:"Aurora Storage",status:"online",network:"nb-iot",firmware:"3.8.1",health:92},{id:"SM-VA-70114",site:"GreenRoute Hub",status:"alert",network:"lte-m",firmware:"3.7.4",health:68}];
export async function GET(req:NextRequest){const status=req.nextUrl.searchParams.get("status");return NextResponse.json({data:status?meters.filter(x=>x.status===status):meters,meta:{count:meters.length}})}
