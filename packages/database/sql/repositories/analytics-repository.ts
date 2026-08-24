import { prisma } from "../../src/clients/prisma";

export async function getAnalyticsSnapshot(organizationId?: string) {
  const where = organizationId ? { organizationId } : {};
  const [assets, activeAssets, capacity] = await Promise.all([
    prisma.energyAsset.count({ where }),
    prisma.energyAsset.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.energyAsset.aggregate({ where, _sum: { capacityMw: true } }),
  ]);
  return { assets, activeAssets, capacityMw: Number(capacity._sum.capacityMw ?? 0) };
}
