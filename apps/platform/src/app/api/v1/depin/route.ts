import { NextResponse } from "next/server";
import { depinNodes } from "@/lib/depin";

export async function GET() {
  return NextResponse.json({
    nodes: depinNodes,
    networks: ["solana", "lorawan"],
    providers: ["powerchain", "helium"],
  });
}
