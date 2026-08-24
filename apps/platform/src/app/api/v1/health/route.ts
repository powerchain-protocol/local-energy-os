import { NextResponse } from "next/server";
import { PLATFORM_VERSION } from "@/config/release";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "powerchain-platform",
    version: PLATFORM_VERSION,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
}
