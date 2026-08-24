import { z, type ZodType } from "zod";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; issues?: z.ZodIssue[] };

export function safeAction<Input, Output>(schema: ZodType<Input>, handler: (input: Input) => Promise<Output>) {
  return async (rawInput: unknown): Promise<ActionResult<Output>> => {
    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) return { ok: false, error: "Validation failed", issues: parsed.error.issues };
    try {
      return { ok: true, data: await handler(parsed.data) };
    } catch (error) {
      console.error("PowerChain safe action failed", error);
      return { ok: false, error: "The operation could not be completed" };
    }
  };
}
