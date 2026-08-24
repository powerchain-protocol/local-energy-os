import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/login", "/api/v1/health", "/api/v1/readiness"]);
export function isPublicPath(request: NextRequest) {
  return PUBLIC_PATHS.has(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/api/v1/auth/");
}
