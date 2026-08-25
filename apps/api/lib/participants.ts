import { getPrismaClient } from "@powerchain/database";

export async function participantSummary(organizationId: string) {
  const prisma = getPrismaClient();
  const grouped = await prisma.participant.groupBy({ by: ["type"], where: { organizationId }, _count: { _all: true } });
  const counts = Object.fromEntries(grouped.map(row => [row.type, row._count._all]));
  return {
    prosumers: counts.PROSUMER ?? 0,
    consumers: counts.CONSUMER ?? 0,
    clients: counts.CLIENT ?? 0,
    gridOperators: counts.GRID_OPERATOR ?? 0,
  };
}

export function listParticipants(organizationId: string, type: "PROSUMER" | "CONSUMER" | "CLIENT" | "GRID_OPERATOR") {
  return getPrismaClient().participant.findMany({ where: { organizationId, type }, orderBy: { createdAt: "desc" }, take: 100 });
}
