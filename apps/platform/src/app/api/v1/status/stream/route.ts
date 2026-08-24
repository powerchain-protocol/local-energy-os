export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const payload = {
          status: "online",
          latencyMs: Math.floor(18 + Math.random() * 24),
          updatedAt: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      send();
      interval = setInterval(send, 15_000);
      request.signal.addEventListener("abort", () => {
        if (interval) clearInterval(interval);
        try { controller.close(); } catch { /* stream already closed */ }
      });
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}
