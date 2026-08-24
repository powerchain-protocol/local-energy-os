import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const energyAssetSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(160),
  type: z.enum(["SOLAR", "WIND", "HYDRO", "BATTERY", "BIOMASS", "GRID"]),
  status: z.enum(["ACTIVE", "MAINTENANCE", "OFFLINE", "COMMISSIONING"]),
  capacityMw: z.number().nonnegative(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const telemetrySchema = z.object({
  assetId: z.string().uuid(),
  metric: z.string().min(1).max(80),
  value: z.number().finite(),
  unit: z.string().min(1).max(24),
  recordedAt: z.coerce.date(),
  quality: z.enum(["GOOD", "ESTIMATED", "BAD"]).default("GOOD"),
});

export type Organization = z.infer<typeof organizationSchema>;
export type EnergyAsset = z.infer<typeof energyAssetSchema>;
export type Telemetry = z.infer<typeof telemetrySchema>;
