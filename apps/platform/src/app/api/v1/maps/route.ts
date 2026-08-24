import { type NextRequest, NextResponse } from "next/server";
import { searchMapAssets } from "@/maps/maps";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const kind = request.nextUrl.searchParams.get("kind") ?? "all";
  return NextResponse.json({ assets: searchMapAssets(query, kind), query, kind });
}
