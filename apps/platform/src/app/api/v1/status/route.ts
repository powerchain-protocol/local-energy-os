import { NextResponse } from "next/server";
import { SOLANA_NETWORKS, SUI_NETWORKS } from "@/config/networks";
import { PLATFORM_VERSION } from "@/config/release";

export async function GET() {
  return NextResponse.json(
    {
      status: "operational",
      version: PLATFORM_VERSION,
      networks: [
        ...Object.values(SOLANA_NETWORKS).map(({ family, id, label }) => ({ family, id, label })),
        ...Object.values(SUI_NETWORKS).map(({ family, id, label }) => ({ family, id, label }))
      ],
      timestamp: new Date().toISOString()
    },
    { headers: { "cache-control": "no-store" } }
  );
}
