import type { NextRequest, NextResponse } from "next/server";

export function attachRequestId(request: NextRequest, response: NextResponse) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("x-request-id", requestId);
  return response;
}
