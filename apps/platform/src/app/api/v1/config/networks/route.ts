import { NextResponse } from "next/server";
import {
  DEFAULT_CLUSTER,
  DEFAULT_SUI_NETWORK,
  POWERCHAIN_PROGRAM_IDS,
  SOLANA_NETWORKS,
  SUI_NETWORKS
} from "@/config/networks";

export async function GET() {
  return NextResponse.json({
    defaults: { solana: DEFAULT_CLUSTER, sui: DEFAULT_SUI_NETWORK },
    networks: {
      solana: Object.values(SOLANA_NETWORKS),
      sui: Object.values(SUI_NETWORKS)
    },
    programIds: POWERCHAIN_PROGRAM_IDS
  });
}
