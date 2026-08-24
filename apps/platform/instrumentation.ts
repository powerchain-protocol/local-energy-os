/**
 * Optional Next.js instrumentation hook.
 *
 * This entry point is intentionally dependency-free. Provider-specific tracing
 * is initialized from server-only runtime modules after application startup.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OTEL_ENABLED === "true") {
    console.info("[PowerChain] Observability hooks enabled.");
  }
}
