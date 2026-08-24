import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({ok:true,data:{solana:Boolean(process.env.SOLANA_RPC_URL),sui:Boolean(process.env.SUI_RPC_URL),circle:Boolean(process.env.CIRCLE_API_KEY),helius:Boolean(process.env.HELIUS_API_KEY)}});}
