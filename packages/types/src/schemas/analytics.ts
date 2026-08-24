import { z } from "zod";

export const analyticsRangeSchema = z.enum(["24h", "7d", "30d", "90d", "1y"]);
export const analyticsQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  range: analyticsRangeSchema.default("30d"),
  assetIds: z.array(z.string().uuid()).max(100).default([]),
});
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
