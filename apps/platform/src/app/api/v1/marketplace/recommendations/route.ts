import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceRecommendations } from "@/services/marketplace";
import type { ExchangeMarket } from "@/types/exchange";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = params.get("market") as ExchangeMarket | null;
  const maxDistance = params.get("maxDistanceKm");
  const data = getMarketplaceRecommendations({
    market: market ?? undefined,
    region: params.get("region") ?? undefined,
    maxDistanceKm: maxDistance ? Number(maxDistance) : undefined,
  });
  return NextResponse.json({ data, meta: { count: data.length, model: "marketplace-ranking-v1" } });
}
