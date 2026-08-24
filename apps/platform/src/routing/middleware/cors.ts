import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const HEADERS = "Content-Type, Authorization, X-Request-Id, X-PowerChain-Signature";
export function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const configured = (process.env.CORS_ALLOWED_ORIGINS ?? "").split(",").map(v => v.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  if (origin && (configured.includes(origin) || (configured.length === 0 && process.env.NODE_ENV !== "production"))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Methods", METHODS);
  response.headers.set("Access-Control-Allow-Headers", HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}
