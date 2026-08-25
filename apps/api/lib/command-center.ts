import { getPrismaClient } from "@powerchain/database";
import { participantSummary } from "./participants";
import type { RuntimeConfig } from "@powerchain/config";

export async function commandCenter(organizationId: string, runtime: RuntimeConfig) {
  const prisma = getPrismaClient();
  const [batchTotals, positionTotals, positions, participants] = await Promise.all([
    prisma.energyBatch.aggregate({ where: { organizationId }, _sum: { verifiedWh: true, invalidatedWh: true, positionedWh: true, retiredWh: true }, _count: { _all: true } }),
    prisma.energyPosition.aggregate({ where: { batch: { organizationId } }, _sum: { amountWh: true, reservedWh: true, retiredWh: true }, _count: { _all: true } }),
    prisma.energyPosition.count({ where: { batch: { organizationId }, state: { in: ["RESERVED", "COMMITTED", "DELIVERING", "SETTLING"] } } }),
    participantSummary(organizationId),
  ]);
  const verifiedWh = batchTotals._sum.verifiedWh ?? 0n;
  const invalidatedWh = batchTotals._sum.invalidatedWh ?? 0n;
  const positionedWh = batchTotals._sum.positionedWh ?? 0n;
  const retiredWh = batchTotals._sum.retiredWh ?? 0n;
  const availableVerifiedWh = verifiedWh - invalidatedWh - positionedWh;
  return {
    context: { organizationId },
    runtime: { environment: runtime.environment, operatingMode: runtime.operatingMode, dataMode: runtime.dataMode, writeMode: runtime.writeMode, network: runtime.network },
    energyLedger: {
      batchCount: batchTotals._count._all,
      verifiedWh,
      invalidatedWh,
      positionedWh,
      retiredWh,
      availableVerifiedWh: availableVerifiedWh > 0n ? availableVerifiedWh : 0n,
    },
    rwa: {
      positionCount: positionTotals._count._all,
      activeOperations: positions,
      totalPositionWh: positionTotals._sum.amountWh ?? 0n,
      reservedWh: positionTotals._sum.reservedWh ?? 0n,
      retiredWh: positionTotals._sum.retiredWh ?? 0n,
    },
    participants,
    pwrc: {
      canonicalChain: "SOLANA",
      wrappedChain: "SUI",
      balanceSource: "UNAVAILABLE",
      note: "Wallet balances are intentionally not synthesized by the Energy Ledger API.",
    },
  };
}
