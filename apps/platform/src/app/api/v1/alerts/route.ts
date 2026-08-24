import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({data:[{id:"alt-1",severity:"critical",title:"Transformer temperature high",status:"open"},{id:"alt-2",severity:"medium",title:"Battery cycle efficiency below target",status:"investigating"}]});}
