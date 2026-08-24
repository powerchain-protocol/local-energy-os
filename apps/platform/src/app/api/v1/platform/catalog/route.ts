import { NextResponse } from "next/server";
import { PLATFORM_LAYERS, summarizePlatformCatalog } from "@/data/platform";
import { PLATFORM_VERSION } from "@/config/release";

export async function GET() {
  return NextResponse.json({
    data: PLATFORM_LAYERS,
    summary: summarizePlatformCatalog(),
    meta: { version: PLATFORM_VERSION, generatedAt: new Date().toISOString() },
  });
}
