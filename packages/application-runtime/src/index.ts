import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

export interface ApplicationManifest {
  id: string;
  name: string;
  version: "1.0.0";
  description: string;
  basePath: string;
  capabilities: readonly string[];
}

export interface RequestContext {
  params: Readonly<Record<string, string>>;
  requestId: string;
  receivedAt: string;
}

export type RouteHandler = (request: Request, context: RequestContext) => Response | Promise<Response>;

export interface ApplicationRoute {
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  path: string;
  summary: string;
  handler: RouteHandler;
}

export interface ApplicationOptions {
  manifest: ApplicationManifest;
  routes?: readonly ApplicationRoute[];
  readiness?: () => boolean | Promise<boolean>;
}

export class ApplicationError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.status = status;
  }
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...jsonHeaders, ...Object.fromEntries(new Headers(init.headers).entries()) },
  });
}

export async function readJson<T>(request: Request): Promise<T> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new ApplicationError("UNSUPPORTED_MEDIA_TYPE", "Expected an application/json request body", 415);
  }
  try {
    return await request.json() as T;
  } catch {
    throw new ApplicationError("INVALID_JSON", "Request body is not valid JSON", 400);
  }
}

function compilePath(path: string) {
  const names: string[] = [];
  const pattern = path
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      names.push(segment.slice(1));
      return "([^/]+)";
    })
    .join("/");
  return { names, regex: new RegExp(`^${pattern}/?$`) };
}

export function createApplication(options: ApplicationOptions) {
  const registered = (options.routes ?? []).map((route) => ({ ...route, matcher: compilePath(route.path) }));

  async function fetch(request: Request) {
    const requestId = request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
    const receivedAt = new Date().toISOString();
    const pathname = new URL(request.url).pathname;
    const headers = { "x-request-id": requestId };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...headers, allow: "GET,POST,PUT,PATCH,DELETE,OPTIONS" } });
    }
    if (request.method === "GET" && pathname === "/health/live") {
      return json({ status: "ok", application: options.manifest.id, version: options.manifest.version, checkedAt: receivedAt }, { headers });
    }
    if (request.method === "GET" && pathname === "/health/ready") {
      const ready = await options.readiness?.() ?? true;
      return json({ status: ready ? "ready" : "not_ready", application: options.manifest.id, checkedAt: receivedAt }, { status: ready ? 200 : 503, headers });
    }
    if (request.method === "GET" && pathname === "/meta") {
      return json({ ...options.manifest, routes: registered.map(({ method, path, summary }) => ({ method, path, summary })) }, { headers });
    }

    const route = registered.find((candidate) => candidate.method === request.method && candidate.matcher.regex.test(pathname));
    if (!route) return json({ error: { code: "NOT_FOUND", message: "Route not found" }, requestId }, { status: 404, headers });

    const match = route.matcher.regex.exec(pathname);
    const params = Object.fromEntries(route.matcher.names.map((name, index) => [name, decodeURIComponent(match?.[index + 1] ?? "")]));
    try {
      const response = await route.handler(request, { params, requestId, receivedAt });
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("x-request-id", requestId);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
    } catch (error) {
      const known = error instanceof ApplicationError;
      return json({ error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "Unexpected application error" }, requestId }, { status: known ? error.status : 500, headers });
    }
  }

  return { manifest: options.manifest, routes: options.routes ?? [], fetch };
}

export type PowerChainApplication = ReturnType<typeof createApplication>;

function requestUrl(request: IncomingMessage) {
  const host = request.headers.host ?? "localhost";
  return new URL(request.url ?? "/", `http://${host}`).toString();
}

async function requestBody(request: IncomingMessage, maximumBytes: number) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > maximumBytes) throw new ApplicationError("PAYLOAD_TOO_LARGE", "Request body exceeds the configured limit", 413);
    chunks.push(buffer);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

async function forward(application: PowerChainApplication, request: IncomingMessage, response: ServerResponse, maximumBodyBytes: number) {
  try {
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await requestBody(request, maximumBodyBytes);
    const webRequest = new Request(requestUrl(request), { method: request.method, headers: request.headers as HeadersInit, body });
    const webResponse = await application.fetch(webRequest);
    response.statusCode = webResponse.status;
    webResponse.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(Buffer.from(await webResponse.arrayBuffer()));
  } catch (error) {
    const known = error instanceof ApplicationError;
    response.statusCode = known ? error.status : 500;
    response.setHeader("content-type", jsonHeaders["content-type"]);
    response.end(JSON.stringify({ error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "Unexpected server error" } }));
  }
}

export function serveApplication(application: PowerChainApplication, options: { host?: string; port: number; maximumBodyBytes?: number }) {
  const server = createServer((request, response) => void forward(application, request, response, options.maximumBodyBytes ?? 1_048_576));
  server.listen(options.port, options.host ?? "0.0.0.0");
  return {
    server,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

export function startApplication(application: PowerChainApplication, fallbackPort: number) {
  const rawPort = process.env.PORT;
  const port = rawPort ? Number.parseInt(rawPort, 10) : fallbackPort;
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new ApplicationError("INVALID_PORT", "PORT must be an integer from 1 through 65535");
  const runtime = serveApplication(application, { host: process.env.HOST, port });
  process.stdout.write(`${application.manifest.name} listening on ${process.env.HOST ?? "0.0.0.0"}:${port}\n`);
  return runtime;
}
