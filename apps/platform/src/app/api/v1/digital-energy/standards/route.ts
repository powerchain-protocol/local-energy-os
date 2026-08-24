import { PET20_VERSION, ENERGY_RWA_ASSET_CLASS, ENERGY_RWA_BACKING_LEDGER } from "@powerchain/energy-rwa";
import { KWH, MWH, GWH } from "@powerchain/energy-core";
import { ENERGY_OPERATIONS_VERSION } from "@powerchain/energy-operations";
import { ENERGY_CONTROLS_VERSION, defaultSettlementApprovalPolicy } from "@powerchain/energy-controls";
import { digitalEnergyResponse, getDigitalEnergyContext } from "@/lib/digital-energy/server";

export async function GET(request: Request) {
  const context = await getDigitalEnergyContext(request);
  return digitalEnergyResponse({
    canonicalUnit: "Wh",
    units: {
      kWh: KWH.toString(),
      MWh: MWH.toString(),
      GWh: GWH.toString(),
    },
    pet20: {
      version: PET20_VERSION,
      assetClass: ENERGY_RWA_ASSET_CLASS,
      backingLedger: ENERGY_RWA_BACKING_LEDGER,
      tokenizationOptional: true,
      physicalEnergyAuthoritative: true,
    },
    operations: {
      version: ENERGY_OPERATIONS_VERSION,
      digitalTwin: true,
      physicalDelivery: true,
      reconciliation: true,
      financialSettlement: true,
      meterEvidenceRequiredForDelivery: true,
      financialSettlementDoesNotProveDelivery: true,
      blockchainConfirmationDoesNotCreateEnergy: true,
    },
    institutionalControls: {
      version: ENERGY_CONTROLS_VERSION,
      settlementReviewHash: "SHA-256 / POWERCHAIN_SETTLEMENT_REVIEW_V1",
      makerCheckerRequired: defaultSettlementApprovalPolicy().makerCheckerRequired,
      approvalCountConfigurable: true,
      defaultApprovalsRequired: defaultSettlementApprovalPolicy().requiredApprovals,
      approvalsBoundToExactReviewHash: true,
      transactionalOutbox: true,
      outboxDelivery: "AT_LEAST_ONCE",
      outboxConsumerIdempotencyRequired: true,
      financialSettlementRemainsSeparateFromPhysicalDelivery: true,
    },
    separation: ["Electricity", "Energy RWA", "Delivery", "Money", "PWRC", "wPWRC"],
    networks: {
      solana: {
        role: "PRIMARY_EXECUTION",
        asset: "PWRC",
        representation: "SPL Token-2022",
        explorer: "Solscan",
      },
      sui: {
        role: "SECONDARY_OBJECT_ENVIRONMENT",
        asset: "wPWRC",
        representation: "Move Object",
        explorer: "Suiscan",
      },
    },
  }, context);
}
