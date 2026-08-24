import { z } from "zod";
import { sendMail } from "@/lib/server/mail";
import { rateLimit, requestKey } from "@/lib/server/rate-limit";

const schema = z.object({ to: z.string().email(), subject: z.string().min(1).max(120), title: z.string().min(1).max(120), preview: z.string().max(160), body: z.string().min(1).max(5000), actionLabel: z.string().max(40).optional(), actionUrl: z.string().url().optional() });
export async function POST(request: Request) {
  if (!rateLimit(`mail:${requestKey(request)}`, 5, 60_000).allowed) return Response.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ ok: false, error: "Invalid message", issues: parsed.error.issues }, { status: 400 });
  return Response.json({ ok: true, result: await sendMail(parsed.data) });
}
