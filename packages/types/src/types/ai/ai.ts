import type { ActionResult } from "../actions";

export type AIMessage = { role: "user" | "assistant" | "system"; content: string };

export async function getPowerChainInsight(messages: AIMessage[]): Promise<ActionResult<AIMessage>> {
  const latest = messages.at(-1)?.content?.trim();
  if (!latest) return { ok: false, error: "A message is required", code: "EMPTY_MESSAGE" };

  return {
    ok: true,
    data: {
      role: "assistant",
      content: `PowerChain AI has reviewed “${latest}”. Connect an AI provider to replace this safe beta response with live analysis.`,
    },
  };
}

export const aiInsights = [
  "Solar output is tracking 3.8% above forecast.",
  "Battery cycle efficiency remains within the target range.",
  "Inspect inverter PC-SOL-014 within the next maintenance window.",
] as const;
