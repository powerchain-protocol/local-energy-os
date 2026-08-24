const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/health/live") {
      return Response.json({ status: "ok", application: "powerchain-edge", version: "1.0.0" });
    }
    if (!allowedMethods.has(request.method)) return Response.json({ error: "Method not allowed" }, { status: 405 });
    if (!env.ORIGIN_URL) return Response.json({ error: "Origin is not configured" }, { status: 503 });

    const origin = new URL(env.ORIGIN_URL);
    origin.pathname = requestUrl.pathname;
    origin.search = requestUrl.search;
    const headers = new Headers(request.headers);
    headers.set("x-forwarded-host", requestUrl.host);
    headers.set("x-request-id", headers.get("x-request-id") || crypto.randomUUID());
    const upstream = await fetch(new Request(origin, { method: request.method, headers, body: request.body, redirect: "manual" }));
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("x-content-type-options", "nosniff");
    responseHeaders.set("referrer-policy", "strict-origin-when-cross-origin");
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  },
};
