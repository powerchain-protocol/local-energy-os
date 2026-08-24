import "server-only";

let registered = false;

export function registerTracing(): void {
  if (registered || process.env.OTEL_ENABLED !== "true") return;
  registered = true;
  console.info("[PowerChain] Observability tracing registered.");
}
