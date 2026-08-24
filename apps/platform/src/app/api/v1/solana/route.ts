import { NextResponse } from "next/server";
import { getSolanaAccount, getTokenAccounts } from "@/solana/solana";
import { publicKeySchema } from "@/types/validate";
export async function GET(request: Request) { try { const address=publicKeySchema.parse(new URL(request.url).searchParams.get("address")); const [account,tokens]=await Promise.all([getSolanaAccount(address),getTokenAccounts(address)]); return NextResponse.json({ok:true,data:{account,tokens}}); } catch(error){ return NextResponse.json({ok:false,error:error instanceof Error?error.message:"Invalid request",fallback:{balanceSol:0,tokens:[]}}, {status:400}); } }
