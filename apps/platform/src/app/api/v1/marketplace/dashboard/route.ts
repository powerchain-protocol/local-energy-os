import { NextResponse } from "next/server";
import { getMarketplaceDashboard } from "@/services/marketplace";

export async function GET() {
  return NextResponse.json({ data: getMarketplaceDashboard(), meta: { source: "marketplace-service" } });
}
