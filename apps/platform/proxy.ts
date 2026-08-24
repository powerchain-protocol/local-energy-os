import { NextResponse, type NextRequest } from "next/server";
import { applyCors } from "./src/routing/middleware/cors";
import { applySecurityHeaders } from "./src/routing/middleware/security";
import { attachRequestId } from "./src/routing/middleware/request-id";

const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$/i;
export function proxy(request: NextRequest) {
  if (PUBLIC_FILE.test(request.nextUrl.pathname)) return NextResponse.next();
  if (request.method === "OPTIONS" && request.nextUrl.pathname.startsWith("/api/")) {
    return applyCors(request, new NextResponse(null, { status: 204 }));
  }
  const response = NextResponse.next();
  attachRequestId(request, response);
  applySecurityHeaders(response);
  if (request.nextUrl.pathname.startsWith("/api/")) applyCors(request, response);
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
