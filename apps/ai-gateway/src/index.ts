import { gridLlmDefault } from "@powerchain/ai-core";
import { routeInference } from "@powerchain/ai-gateway";
import { ApplicationError, createApplication, json, readJson } from "@powerchain/application-runtime";

export const applicationName = "ai-gateway" as const;

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain AI Gateway",
    version: "1.0.0",
    description: "Controlled GridLLM inference routing and metered AI execution boundary.",
    basePath: "/api/v1/ai",
    capabilities: ["inference", "provider-routing", "cost-boundaries"],
  },
  routes: [{
    method: "POST",
    path: "/api/v1/ai/inference",
    summary: "Submit a GridLLM inference request",
    async handler(request, context) {
      const body = await readJson<{ message?: string; userId?: string; maxCostUsd?: string }>(request);
      if (!body.message?.trim()) throw new ApplicationError("MESSAGE_REQUIRED", "message is required");
      if (body.message.length > 32_000) throw new ApplicationError("MESSAGE_TOO_LARGE", "message exceeds 32000 characters", 413);
      const response = await routeInference({ requestId: context.requestId, userId: body.userId?.trim() || "anonymous", message: body.message, model: gridLlmDefault, maxCostUsd: body.maxCostUsd });
      return json(response);
    },
  }],
});
