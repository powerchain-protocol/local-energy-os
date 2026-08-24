import { NextResponse } from "next/server";
const assets=[{id:"sf-1001",name:"North Ridge Solar",type:"solar",capacityMw:86,health:97.2,status:"online"},{id:"wf-2003",name:"Coastal Wind 03",type:"wind",capacityMw:112,health:91.8,status:"online"},{id:"bs-500",name:"Battery Hub A",type:"battery",capacityMw:42,health:88.6,status:"maintenance"}];
export async function GET(){return NextResponse.json({data:assets,meta:{total:assets.length}});}
