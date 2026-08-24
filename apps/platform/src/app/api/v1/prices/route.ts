import { NextResponse } from "next/server"; import { getBirdeyePrice } from "@/clients/birdeye";
export async function GET(request:Request){const address=new URL(request.url).searchParams.get("address")??process.env.NEXT_PUBLIC_PWRC_MINT??"";const data=address?await getBirdeyePrice(address):null;return NextResponse.json({ok:true,data,fallback:{symbol:"PWRC",priceUsd:0}});}
