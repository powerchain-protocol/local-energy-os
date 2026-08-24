import { EnergyInvariantError, parseWh, transitionEnergyPosition, type EnergyPositionState, type EnergyWh } from "@powerchain/energy-core";
import {
  assertSettlementCanSubmit,
  assertSettlementProposalAllowed,
  defaultSettlementApprovalPolicy,
  evaluateSettlementControls,
  settlementReviewHash,
  type SettlementApproval,
  type SettlementApprovalDecision,
  type SettlementControlStatus,
} from "@powerchain/energy-controls";

export const ENERGY_OPERATIONS_VERSION = "1.0.0" as const;

export const DIGITAL_TWIN_ASSET_TYPES = ["SOLAR_ARRAY", "WIND_TURBINE", "BATTERY", "EVSE", "SMART_METER", "GRID_NODE", "PLANT"] as const;
export type DigitalTwinAssetType = (typeof DIGITAL_TWIN_ASSET_TYPES)[number];
export type DigitalTwinOperationalState = "OPERATIONAL" | "DEGRADED" | "STALE" | "OFFLINE" | "MAINTENANCE";
export type TelemetryFreshness = "FRESH" | "AGING" | "STALE" | "UNAVAILABLE";

export interface DigitalTwinAsset {
  id: string;
  organizationId: string;
  siteId: string;
  assetType: DigitalTwinAssetType;
  label: string;
  gridAreaId?: string;
  observedAt: Date;
  telemetryAgeSeconds: number;
  freshness: TelemetryFreshness;
  state: DigitalTwinOperationalState;
  powerW?: bigint;
  availabilityPpm?: bigint;
  stateOfChargePpm?: bigint;
  exportLimitW?: bigint;
  evidenceRoot?: string;
}

export type EnergyDeliveryState = "COMMITTED" | "DELIVERING" | "DELIVERED" | "DISPUTED" | "RECONCILED" | "CANCELLED";
export interface EnergyDelivery {
  id: string;
  organizationId: string;
  energyPositionId: string;
  reservationId?: string;
  committedWh: EnergyWh;
  deliveredWh: EnergyWh;
  state: EnergyDeliveryState;
  intervalStart: Date;
  intervalEnd: Date;
  meterEvidenceRoot?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReconciliationState = "MATCHED" | "WITHIN_TOLERANCE" | "REVIEW_REQUIRED" | "RECONCILED";
export interface EnergyReconciliation {
  id: string;
  organizationId: string;
  deliveryId: string;
  expectedWh: EnergyWh;
  deliveredWh: EnergyWh;
  varianceWh: bigint;
  toleranceWh: EnergyWh;
  state: ReconciliationState;
  reconciledAt?: Date;
  createdAt: Date;
}

export const SETTLEMENT_ASSETS = ["USDC", "EURC", "FIAT_EUR"] as const;
export type SettlementAsset = (typeof SETTLEMENT_ASSETS)[number];
export const ENERGY_SETTLEMENT_NETWORKS = ["SOLANA", "OFFCHAIN"] as const;
export type EnergySettlementNetwork = (typeof ENERGY_SETTLEMENT_NETWORKS)[number];
export type EnergySettlementState = "READY" | "SUBMITTED" | "CONFIRMED" | "RECONCILED" | "FAILED" | "CANCELLED";
export interface EnergySettlement {
  id: string;
  organizationId: string;
  deliveryId: string;
  reconciliationId: string;
  asset: SettlementAsset;
  network: EnergySettlementNetwork;
  amountMinor: bigint;
  state: EnergySettlementState;
  reference?: string;
  reviewHash: string;
  createdBy: string;
  approvalsRequired: number;
  control: SettlementControlStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyOperationsSummary {
  organizationId: string;
  twinAssets: number;
  staleTwinAssets: number;
  offlineTwinAssets: number;
  activeDeliveries: number;
  committedWh: EnergyWh;
  deliveredWh: EnergyWh;
  reviewRequiredReconciliations: number;
  pendingSettlements: number;
  pendingSettlementApprovals: number;
  rejectedSettlements: number;
  confirmedSettlements: number;
}

export interface EnergyOperationsSnapshot {
  version: typeof ENERGY_OPERATIONS_VERSION;
  organizationId: string;
  twins: DigitalTwinAsset[];
  deliveries: EnergyDelivery[];
  reconciliations: EnergyReconciliation[];
  settlements: EnergySettlement[];
  summary: EnergyOperationsSummary;
  controls: {
    settlementApprovalsRequired: number;
    makerCheckerRequired: boolean;
    pendingSettlementApprovals: number;
    rejectedSettlements: number;
    pendingOutboxEvents: number;
  };
  principles: {
    physicalDeliveryRequiresMeterEvidence: true;
    financialSettlementDoesNotProveDelivery: true;
    blockchainConfirmationDoesNotCreateEnergy: true;
  };
}

export function telemetryFreshness(ageSeconds: number): TelemetryFreshness {
  if (!Number.isFinite(ageSeconds) || ageSeconds < 0) return "UNAVAILABLE";
  if (ageSeconds <= 60) return "FRESH";
  if (ageSeconds <= 300) return "AGING";
  return "STALE";
}

export function deriveTwinOperationalState(input: { ageSeconds: number; availabilityPpm?: bigint; maintenance?: boolean }): DigitalTwinOperationalState {
  if (input.maintenance) return "MAINTENANCE";
  const freshness = telemetryFreshness(input.ageSeconds);
  if (freshness === "UNAVAILABLE") return "OFFLINE";
  if (freshness === "STALE") return "STALE";
  if (input.availabilityPpm !== undefined && input.availabilityPpm < 950_000n) return "DEGRADED";
  return "OPERATIONAL";
}

const deliveryTransitions: Record<EnergyDeliveryState, readonly EnergyDeliveryState[]> = {
  COMMITTED: ["DELIVERING", "CANCELLED", "DISPUTED"],
  DELIVERING: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["RECONCILED", "DISPUTED"],
  DISPUTED: ["RECONCILED", "CANCELLED"],
  RECONCILED: [],
  CANCELLED: [],
};

export function transitionDelivery(current: EnergyDeliveryState, next: EnergyDeliveryState): EnergyDeliveryState {
  if (current === next) return current;
  if (!deliveryTransitions[current].includes(next)) throw new EnergyInvariantError("INVALID_DELIVERY_TRANSITION", `${current} cannot transition to ${next}`);
  return next;
}

const settlementTransitions: Record<EnergySettlementState, readonly EnergySettlementState[]> = {
  READY: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["CONFIRMED", "FAILED"],
  CONFIRMED: ["RECONCILED"],
  RECONCILED: [],
  FAILED: ["SUBMITTED", "CANCELLED"],
  CANCELLED: [],
};

export function transitionSettlement(current: EnergySettlementState, next: EnergySettlementState): EnergySettlementState {
  if (current === next) return current;
  if (!settlementTransitions[current].includes(next)) throw new EnergyInvariantError("INVALID_SETTLEMENT_TRANSITION", `${current} cannot transition to ${next}`);
  return next;
}


export function createDigitalTwinAsset(input: {
  id:string; organizationId:string; siteId:string; assetType:DigitalTwinAssetType; label:string; gridAreaId?:string;
  observedAt:Date; powerW?:string|bigint; availabilityPpm?:string|bigint; stateOfChargePpm?:string|bigint; exportLimitW?:string|bigint; evidenceRoot?:string; maintenance?:boolean; now?:Date;
}):DigitalTwinAsset {
  if (!input.id.trim() || !input.organizationId.trim() || !input.siteId.trim() || !input.label.trim()) throw new EnergyInvariantError("TWIN_IDENTITY_REQUIRED", "Digital Twin id, organization, site and label are required");
  if (!DIGITAL_TWIN_ASSET_TYPES.includes(input.assetType)) throw new EnergyInvariantError("TWIN_ASSET_TYPE_INVALID", `Unsupported Digital Twin asset type: ${String(input.assetType)}`);
  const now=input.now??new Date();
  if (!Number.isFinite(input.observedAt.getTime())) throw new EnergyInvariantError("TWIN_OBSERVED_AT_INVALID", "Digital Twin observedAt must be a valid timestamp");
  if (input.observedAt.getTime() > now.getTime() + 60_000) throw new EnergyInvariantError("TWIN_OBSERVED_AT_FUTURE", "Digital Twin observedAt cannot be materially in the future");
  const age=Math.max(0,Math.floor((now.getTime()-input.observedAt.getTime())/1000));
  const availabilityPpm=input.availabilityPpm===undefined?undefined:BigInt(input.availabilityPpm);
  if(availabilityPpm!==undefined&&(availabilityPpm<0n||availabilityPpm>1_000_000n))throw new EnergyInvariantError("TWIN_AVAILABILITY_INVALID","Availability must be 0..1,000,000 ppm");
  const stateOfChargePpm=input.stateOfChargePpm===undefined?undefined:BigInt(input.stateOfChargePpm);
  if(stateOfChargePpm!==undefined&&(stateOfChargePpm<0n||stateOfChargePpm>1_000_000n))throw new EnergyInvariantError("TWIN_SOC_INVALID","State of charge must be 0..1,000,000 ppm");
  return {id:input.id,organizationId:input.organizationId,siteId:input.siteId,assetType:input.assetType,label:input.label,...(input.gridAreaId?{gridAreaId:input.gridAreaId}:{}),observedAt:input.observedAt,telemetryAgeSeconds:age,freshness:telemetryFreshness(age),state:deriveTwinOperationalState({ageSeconds:age,...(availabilityPpm!==undefined?{availabilityPpm}:{}),maintenance:input.maintenance}),...(input.powerW!==undefined?{powerW:BigInt(input.powerW)}:{}),...(availabilityPpm!==undefined?{availabilityPpm}:{}),...(stateOfChargePpm!==undefined?{stateOfChargePpm}:{}),...(input.exportLimitW!==undefined?{exportLimitW:BigInt(input.exportLimitW)}:{}),...(input.evidenceRoot?{evidenceRoot:input.evidenceRoot}:{})};
}

export function createDelivery(input: {
  id: string; organizationId: string; energyPositionId: string; reservationId?: string;
  committedWh: string | bigint; intervalStart: Date; intervalEnd: Date; now?: Date;
}): EnergyDelivery {
  const committedWh = parseWh(input.committedWh);
  if (committedWh <= 0n) throw new EnergyInvariantError("DELIVERY_AMOUNT_INVALID", "Committed delivery energy must be greater than zero");
  if (!(input.intervalStart < input.intervalEnd)) throw new EnergyInvariantError("DELIVERY_INTERVAL_INVALID", "Delivery interval start must precede end");
  const now = input.now ?? new Date();
  return { id: input.id, organizationId: input.organizationId, energyPositionId: input.energyPositionId, ...(input.reservationId ? { reservationId: input.reservationId } : {}), committedWh, deliveredWh: 0n, state: "COMMITTED", intervalStart: input.intervalStart, intervalEnd: input.intervalEnd, createdAt: now, updatedAt: now };
}

export function recordDelivery(input: { delivery: EnergyDelivery; deliveredWh: string | bigint; meterEvidenceRoot: string; now?: Date }): EnergyDelivery {
  if (!input.meterEvidenceRoot.trim()) throw new EnergyInvariantError("DELIVERY_EVIDENCE_REQUIRED", "Meter evidence is required to record physical delivery");
  const deliveredWh = parseWh(input.deliveredWh);
  if (deliveredWh <= 0n) throw new EnergyInvariantError("DELIVERED_ENERGY_INVALID", "Delivered energy must be greater than zero");
  const state = input.delivery.state === "COMMITTED" ? transitionDelivery("COMMITTED", "DELIVERING") : input.delivery.state;
  if (state !== "DELIVERING") throw new EnergyInvariantError("DELIVERY_NOT_RECORDABLE", `Delivery ${input.delivery.id} is not accepting meter delivery records`);
  return { ...input.delivery, deliveredWh, meterEvidenceRoot: input.meterEvidenceRoot, state: transitionDelivery("DELIVERING", "DELIVERED"), updatedAt: input.now ?? new Date() };
}

export function reconcileDelivery(input: { id: string; delivery: EnergyDelivery; toleranceWh: string | bigint; now?: Date }): EnergyReconciliation {
  if (input.delivery.state !== "DELIVERED" && input.delivery.state !== "DISPUTED") throw new EnergyInvariantError("DELIVERY_NOT_RECONCILABLE", "Delivery must be delivered or disputed before reconciliation");
  if (!input.delivery.meterEvidenceRoot) throw new EnergyInvariantError("DELIVERY_EVIDENCE_REQUIRED", "Meter evidence is required before reconciliation");
  const toleranceWh = parseWh(input.toleranceWh);
  const varianceWh = input.delivery.deliveredWh - input.delivery.committedWh;
  const absoluteVariance = varianceWh < 0n ? -varianceWh : varianceWh;
  const state: ReconciliationState = absoluteVariance === 0n ? "MATCHED" : absoluteVariance <= toleranceWh ? "WITHIN_TOLERANCE" : "REVIEW_REQUIRED";
  return { id: input.id, organizationId: input.delivery.organizationId, deliveryId: input.delivery.id, expectedWh: input.delivery.committedWh, deliveredWh: input.delivery.deliveredWh, varianceWh, toleranceWh, state, createdAt: input.now ?? new Date() };
}

export function approveReconciliation(reconciliation: EnergyReconciliation, now = new Date()): EnergyReconciliation {
  if (reconciliation.state === "REVIEW_REQUIRED" || reconciliation.state === "MATCHED" || reconciliation.state === "WITHIN_TOLERANCE") return { ...reconciliation, state: "RECONCILED", reconciledAt: now };
  return reconciliation;
}

export function createSettlement(input: {
  id: string; organizationId: string; delivery: EnergyDelivery; reconciliation: EnergyReconciliation;
  asset: SettlementAsset; network: EnergySettlementNetwork; amountMinor: string | bigint;
  createdBy?: string; approvalsRequired?: number; now?: Date;
}): EnergySettlement {
  if (!input.id.trim() || !input.organizationId.trim()) throw new EnergyInvariantError("SETTLEMENT_IDENTITY_REQUIRED", "Settlement id and organization are required");
  if (!SETTLEMENT_ASSETS.includes(input.asset)) throw new EnergyInvariantError("SETTLEMENT_ASSET_INVALID", `Unsupported settlement asset: ${String(input.asset)}`);
  if (!ENERGY_SETTLEMENT_NETWORKS.includes(input.network)) throw new EnergyInvariantError("SETTLEMENT_NETWORK_INVALID", `Unsupported settlement network: ${String(input.network)}`);
  if (input.delivery.state !== "RECONCILED") throw new EnergyInvariantError("DELIVERY_NOT_RECONCILED", "Physical delivery must be reconciled before settlement is prepared");
  if (input.reconciliation.state !== "RECONCILED") throw new EnergyInvariantError("RECONCILIATION_NOT_APPROVED", "Reconciliation must be approved before settlement is prepared");
  if (input.reconciliation.deliveryId !== input.delivery.id) throw new EnergyInvariantError("SETTLEMENT_RECONCILIATION_MISMATCH", "Reconciliation does not belong to delivery");

  const amountMinor = BigInt(input.amountMinor);
  const policy = defaultSettlementApprovalPolicy({
    ...process.env,
    ...(input.approvalsRequired ? { DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED: String(input.approvalsRequired) } : {}),
  });
  const reviewInput = {
    settlementId: input.id,
    organizationId: input.organizationId,
    deliveryId: input.delivery.id,
    reconciliationId: input.reconciliation.id,
    asset: input.asset,
    network: input.network,
    amountMinor,
  };
  assertSettlementProposalAllowed(reviewInput, policy);

  const createdBy = input.createdBy ?? "system";
  const reviewHash = settlementReviewHash(reviewInput);
  const control = evaluateSettlementControls({
    settlement: reviewInput,
    createdBy,
    approvals: [],
    policy,
  });
  const now = input.now ?? new Date();

  return {
    id: input.id,
    organizationId: input.organizationId,
    deliveryId: input.delivery.id,
    reconciliationId: input.reconciliation.id,
    asset: input.asset,
    network: input.network,
    amountMinor,
    state: "READY",
    reviewHash,
    createdBy,
    approvalsRequired: policy.requiredApprovals,
    control,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateOperationsSummary(input: { organizationId: string; twins: readonly DigitalTwinAsset[]; deliveries: readonly EnergyDelivery[]; reconciliations: readonly EnergyReconciliation[]; settlements: readonly EnergySettlement[] }): EnergyOperationsSummary {
  return {
    organizationId: input.organizationId,
    twinAssets: input.twins.length,
    staleTwinAssets: input.twins.filter(item => item.state === "STALE").length,
    offlineTwinAssets: input.twins.filter(item => item.state === "OFFLINE").length,
    activeDeliveries: input.deliveries.filter(item => !["RECONCILED", "CANCELLED"].includes(item.state)).length,
    committedWh: input.deliveries.filter(item => item.state !== "CANCELLED").reduce((sum, item) => sum + item.committedWh, 0n),
    deliveredWh: input.deliveries.reduce((sum, item) => sum + item.deliveredWh, 0n),
    reviewRequiredReconciliations: input.reconciliations.filter(item => item.state === "REVIEW_REQUIRED").length,
    pendingSettlements: input.settlements.filter(item => ["READY", "SUBMITTED", "CONFIRMED"].includes(item.state)).length,
    pendingSettlementApprovals: input.settlements.filter(item => item.state === "READY" && item.control.state === "PENDING").length,
    rejectedSettlements: input.settlements.filter(item => item.control.state === "REJECTED").length,
    confirmedSettlements: input.settlements.filter(item => ["CONFIRMED", "RECONCILED"].includes(item.state)).length,
  };
}

export function createOperationsSnapshot(input: {
  organizationId: string;
  twins: DigitalTwinAsset[];
  deliveries: EnergyDelivery[];
  reconciliations: EnergyReconciliation[];
  settlements: EnergySettlement[];
  pendingOutboxEvents?: number;
}): EnergyOperationsSnapshot {
  const summary = calculateOperationsSummary(input);
  const policy = defaultSettlementApprovalPolicy();
  return {
    version: ENERGY_OPERATIONS_VERSION,
    organizationId: input.organizationId,
    twins: input.twins,
    deliveries: input.deliveries,
    reconciliations: input.reconciliations,
    settlements: input.settlements,
    summary,
    controls: {
      settlementApprovalsRequired: policy.requiredApprovals,
      makerCheckerRequired: policy.makerCheckerRequired,
      pendingSettlementApprovals: summary.pendingSettlementApprovals,
      rejectedSettlements: summary.rejectedSettlements,
      pendingOutboxEvents: input.pendingOutboxEvents ?? 0,
    },
    principles: {
      physicalDeliveryRequiresMeterEvidence: true,
      financialSettlementDoesNotProveDelivery: true,
      blockchainConfirmationDoesNotCreateEnergy: true,
    },
  };
}

export class DigitalEnergyOperationsMemoryStore {
  private twins = new Map<string, DigitalTwinAsset>();
  private deliveries = new Map<string, EnergyDelivery>();
  private reconciliations = new Map<string, EnergyReconciliation>();
  private settlements = new Map<string, EnergySettlement>();
  private approvals = new Map<string, SettlementApproval[]>();
  private idempotency = new Map<string, unknown>();

  constructor(snapshot: EnergyOperationsSnapshot) {
    snapshot.twins.forEach(item => this.twins.set(item.id, item));
    snapshot.deliveries.forEach(item => this.deliveries.set(item.id, item));
    snapshot.reconciliations.forEach(item => this.reconciliations.set(item.id, item));
    snapshot.settlements.forEach(item => this.settlements.set(item.id, item));
  }

  snapshot(organizationId: string): EnergyOperationsSnapshot {
    return createOperationsSnapshot({ organizationId, twins: [...this.twins.values()].filter(item => item.organizationId === organizationId), deliveries: [...this.deliveries.values()].filter(item => item.organizationId === organizationId), reconciliations: [...this.reconciliations.values()].filter(item => item.organizationId === organizationId), settlements: [...this.settlements.values()].filter(item => item.organizationId === organizationId) });
  }

  private once<T>(organizationId: string, scope: string, key: string, action: () => T): T {
    const scoped = `${organizationId}:${scope}:${key}`;
    if (this.idempotency.has(scoped)) return this.idempotency.get(scoped) as T;
    const value = action(); this.idempotency.set(scoped, value); return value;
  }

  upsertTwin(input: Parameters<typeof createDigitalTwinAsset>[0] & { idempotencyKey:string }):DigitalTwinAsset {
    return this.once(input.organizationId, `twin:${input.id}:upsert:${input.observedAt.toISOString()}`, input.idempotencyKey, () => { const value=createDigitalTwinAsset(input); this.twins.set(value.id,value); return value; });
  }

  createDelivery(input: Parameters<typeof createDelivery>[0] & { idempotencyKey: string }): EnergyDelivery {
    return this.once(input.organizationId, `delivery:${input.id}:create`, input.idempotencyKey, () => {
      if (this.deliveries.has(input.id)) throw new EnergyInvariantError("DELIVERY_ALREADY_EXISTS", "Delivery already exists");
      const value = createDelivery(input); this.deliveries.set(value.id, value); return value;
    });
  }

  recordDelivery(input: { organizationId: string; deliveryId: string; deliveredWh: string; meterEvidenceRoot: string; idempotencyKey: string }): EnergyDelivery {
    return this.once(input.organizationId, `delivery:${input.deliveryId}:record`, input.idempotencyKey, () => {
      const current = this.deliveries.get(input.deliveryId); if (!current || current.organizationId !== input.organizationId) throw new EnergyInvariantError("DELIVERY_NOT_FOUND", "Delivery not found");
      const value = recordDelivery({ delivery: current, deliveredWh: input.deliveredWh, meterEvidenceRoot: input.meterEvidenceRoot }); this.deliveries.set(value.id, value); return value;
    });
  }

  reconcile(input: { organizationId: string; deliveryId: string; reconciliationId: string; toleranceWh: string; approve: boolean; idempotencyKey: string }): EnergyReconciliation {
    return this.once(input.organizationId, `delivery:${input.deliveryId}:reconcile`, input.idempotencyKey, () => {
      const delivery = this.deliveries.get(input.deliveryId); if (!delivery || delivery.organizationId !== input.organizationId) throw new EnergyInvariantError("DELIVERY_NOT_FOUND", "Delivery not found");
      let reconciliation = reconcileDelivery({ id: input.reconciliationId, delivery, toleranceWh: input.toleranceWh });
      if (input.approve) reconciliation = approveReconciliation(reconciliation);
      this.reconciliations.set(reconciliation.id, reconciliation);
      if (reconciliation.state === "RECONCILED") this.deliveries.set(delivery.id, { ...delivery, state: transitionDelivery(delivery.state, "RECONCILED"), updatedAt: new Date() });
      return reconciliation;
    });
  }

  createSettlement(input: {
    organizationId: string; settlementId: string; deliveryId: string; reconciliationId: string;
    asset: SettlementAsset; network: EnergySettlementNetwork; amountMinor: string;
    createdBy?: string; approvalsRequired?: number; idempotencyKey: string;
  }): EnergySettlement {
    return this.once(input.organizationId, `settlement:${input.settlementId}:create`, input.idempotencyKey, () => {
      const delivery = this.deliveries.get(input.deliveryId);
      const reconciliation = this.reconciliations.get(input.reconciliationId);
      if (!delivery || delivery.organizationId !== input.organizationId) throw new EnergyInvariantError("DELIVERY_NOT_FOUND", "Delivery not found");
      if (!reconciliation || reconciliation.organizationId !== input.organizationId) throw new EnergyInvariantError("RECONCILIATION_NOT_FOUND", "Reconciliation not found");
      const value = createSettlement({
        id: input.settlementId,
        organizationId: input.organizationId,
        delivery,
        reconciliation,
        asset: input.asset,
        network: input.network,
        amountMinor: input.amountMinor,
        createdBy: input.createdBy,
        approvalsRequired: input.approvalsRequired,
      });
      this.settlements.set(value.id, value);
      this.approvals.set(value.id, []);
      return value;
    });
  }

  approveSettlement(input: {
    organizationId: string; settlementId: string; approvalId: string; actorId: string;
    decision: SettlementApprovalDecision; note?: string; reviewHash: string; idempotencyKey: string;
  }): EnergySettlement {
    return this.once(input.organizationId, `settlement:${input.settlementId}:approval:${input.actorId}`, input.idempotencyKey, () => {
      const current = this.settlements.get(input.settlementId);
      if (!current || current.organizationId !== input.organizationId) throw new EnergyInvariantError("SETTLEMENT_NOT_FOUND", "Settlement not found");
      if (current.state !== "READY") throw new EnergyInvariantError("SETTLEMENT_APPROVAL_STATE_INVALID", "Only READY settlements accept control approvals");
      if (current.reviewHash !== input.reviewHash) throw new EnergyInvariantError("SETTLEMENT_REVIEW_HASH_MISMATCH", "Approval review hash does not match the current settlement proposal");

      const policy = defaultSettlementApprovalPolicy({
        ...process.env,
        DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED: String(current.approvalsRequired),
      });
      if (input.decision === "APPROVED" && policy.makerCheckerRequired && current.createdBy === input.actorId) {
        throw new EnergyInvariantError("SETTLEMENT_MAKER_CHECKER_REQUIRED", "Settlement maker cannot approve their own settlement");
      }

      const approvals = this.approvals.get(current.id) ?? [];
      if (approvals.some(item => item.actorId === input.actorId)) {
        throw new EnergyInvariantError("SETTLEMENT_APPROVER_ALREADY_ACTED", "Approver has already acted on this settlement");
      }

      approvals.push({
        id: input.approvalId,
        organizationId: input.organizationId,
        settlementId: current.id,
        actorId: input.actorId,
        decision: input.decision,
        reviewHash: input.reviewHash,
        ...(input.note ? { note: input.note } : {}),
        createdAt: new Date(),
      });
      this.approvals.set(current.id, approvals);

      const control = evaluateSettlementControls({
        settlement: {
          settlementId: current.id,
          organizationId: current.organizationId,
          deliveryId: current.deliveryId,
          reconciliationId: current.reconciliationId,
          asset: current.asset,
          network: current.network,
          amountMinor: current.amountMinor,
        },
        createdBy: current.createdBy,
        approvals,
        policy,
      });
      const next = { ...current, control, updatedAt: new Date() };
      this.settlements.set(next.id, next);
      return next;
    });
  }

  transitionSettlement(input: { organizationId: string; settlementId: string; state: EnergySettlementState; reference?: string; idempotencyKey: string }): EnergySettlement {
    return this.once(input.organizationId, `settlement:${input.settlementId}:transition:${input.state}`, input.idempotencyKey, () => {
      const current = this.settlements.get(input.settlementId); if (!current || current.organizationId !== input.organizationId) throw new EnergyInvariantError("SETTLEMENT_NOT_FOUND", "Settlement not found");
      const state = transitionSettlement(current.state, input.state);
      if (state === "SUBMITTED") {
        const approvals = this.approvals.get(current.id) ?? [];
        const policy = defaultSettlementApprovalPolicy({
          ...process.env,
          DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED: String(current.approvalsRequired),
        });
        const control = evaluateSettlementControls({
          settlement: {
            settlementId: current.id,
            organizationId: current.organizationId,
            deliveryId: current.deliveryId,
            reconciliationId: current.reconciliationId,
            asset: current.asset,
            network: current.network,
            amountMinor: current.amountMinor,
          },
          createdBy: current.createdBy,
          approvals,
          policy,
        });
        assertSettlementCanSubmit(control);
      }
      if ((state === "CONFIRMED" || state === "RECONCILED") && !String(input.reference ?? current.reference ?? "").trim()) throw new EnergyInvariantError("SETTLEMENT_REFERENCE_REQUIRED", "Confirmed settlement requires an external network or ledger reference");
      const next = { ...current, state, ...(input.reference ? { reference: input.reference } : {}), updatedAt: new Date() }; this.settlements.set(next.id, next); return next;
    });
  }
}

export function createDemoOperationsSnapshot(organizationId = "org_powerchain_demo"): EnergyOperationsSnapshot {
  const observedAt = new Date("2026-08-23T15:40:00.000Z");
  const twins: DigitalTwinAsset[] = [
    { id: "twin_solar_hel", organizationId, siteId: "site_helsinki_solar", assetType: "SOLAR_ARRAY", label: "Helsinki Solar Array", gridAreaId: "FI-HELSINKI-FEEDER-07", observedAt, telemetryAgeSeconds: 24, freshness: "FRESH", state: "OPERATIONAL", powerW: 12_800n, availabilityPpm: 998_000n, evidenceRoot: "telemetry_hel_1540" },
    { id: "twin_wind_esp", organizationId, siteId: "site_espoo_wind", assetType: "WIND_TURBINE", label: "Espoo Wind Cluster", gridAreaId: "FI-ESPOO-FEEDER-12", observedAt, telemetryAgeSeconds: 76, freshness: "AGING", state: "OPERATIONAL", powerW: 18_200_000n, availabilityPpm: 978_000n, evidenceRoot: "telemetry_esp_1540" },
    { id: "twin_battery_hel", organizationId, siteId: "site_helsinki_storage", assetType: "BATTERY", label: "Helsinki BESS", gridAreaId: "FI-HELSINKI-FEEDER-07", observedAt, telemetryAgeSeconds: 312, freshness: "STALE", state: "STALE", powerW: -320_000n, availabilityPpm: 996_000n, stateOfChargePpm: 742_000n, evidenceRoot: "telemetry_bess_1535" },
  ];
  const delivery: EnergyDelivery = { id: "delivery_hel_001", organizationId, energyPositionId: "ep_hel_8310", reservationId: "res_hel_market_001", committedWh: 1_000n, deliveredWh: 986n, state: "DELIVERED", intervalStart: new Date("2026-08-23T11:00:00.000Z"), intervalEnd: new Date("2026-08-23T12:00:00.000Z"), meterEvidenceRoot: "delivery_meter_hel_001", createdAt: new Date("2026-08-23T10:58:00.000Z"), updatedAt: new Date("2026-08-23T12:02:00.000Z") };
  const reconciliation = approveReconciliation(reconcileDelivery({ id: "recon_hel_001", delivery, toleranceWh: 25n, now: new Date("2026-08-23T12:05:00.000Z") }), new Date("2026-08-23T12:06:00.000Z"));
  const reconciledDelivery = { ...delivery, state: "RECONCILED" as const, updatedAt: new Date("2026-08-23T12:06:00.000Z") };
  const settlement = createSettlement({ id: "settlement_hel_001", organizationId, delivery: reconciledDelivery, reconciliation, asset: "EURC", network: "SOLANA", amountMinor: 17n, createdBy: "maker_demo", now: new Date("2026-08-23T12:07:00.000Z") });
  return createOperationsSnapshot({ organizationId, twins, deliveries: [reconciledDelivery], reconciliations: [reconciliation], settlements: [settlement] });
}

export function positionStateForDelivery(current: EnergyPositionState, deliveryState: EnergyDeliveryState): EnergyPositionState {
  if (deliveryState === "COMMITTED" && ["AVAILABLE", "RESERVED", "TRANSFERRED"].includes(current)) return transitionEnergyPosition(current, "COMMITTED");
  if (deliveryState === "DELIVERING" && current === "COMMITTED") return transitionEnergyPosition(current, "DELIVERING");
  if (deliveryState === "DELIVERED" && current === "DELIVERING") return transitionEnergyPosition(current, "DELIVERED");
  if (deliveryState === "DISPUTED" && ["COMMITTED", "DELIVERING", "DELIVERED"].includes(current)) return transitionEnergyPosition(current, "DISPUTED");
  if (deliveryState === "RECONCILED" && current === "DISPUTED") return transitionEnergyPosition(current, "RECONCILED");
  return current;
}
