import { createHash } from "node:crypto";
import { EnergyInvariantError } from "@powerchain/energy-core";

export const ENERGY_CONTROLS_VERSION = "1.0.0" as const;

export type SettlementApprovalDecision = "APPROVED" | "REJECTED";
export type ControlState = "PENDING" | "APPROVED" | "REJECTED";
export type OutboxEventState = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export interface SettlementReviewInput {
  settlementId: string;
  organizationId: string;
  deliveryId: string;
  reconciliationId: string;
  asset: string;
  network: string;
  amountMinor: string | bigint;
}

export interface SettlementApprovalPolicy {
  requiredApprovals: number;
  makerCheckerRequired: boolean;
  allowedAssets: readonly string[];
  allowedNetworks: readonly string[];
}

export interface SettlementApproval {
  id: string;
  organizationId: string;
  settlementId: string;
  actorId: string;
  decision: SettlementApprovalDecision;
  reviewHash: string;
  note?: string;
  createdAt: Date;
}

export interface SettlementControlStatus {
  settlementId: string;
  reviewHash: string;
  createdBy: string;
  requiredApprovals: number;
  approvedBy: string[];
  rejectedBy: string[];
  state: ControlState;
  makerCheckerSatisfied: boolean;
}

export interface EnergyOutboxEvent {
  id: string;
  organizationId: string;
  topic: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  state: OutboxEventState;
  attempts: number;
  createdAt: Date;
  publishedAt?: Date;
  lastError?: string;
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
}

export function settlementReviewHash(input: SettlementReviewInput): string {
  const payload = {
    standard: "POWERCHAIN_SETTLEMENT_REVIEW_V1",
    settlementId: input.settlementId,
    organizationId: input.organizationId,
    deliveryId: input.deliveryId,
    reconciliationId: input.reconciliationId,
    asset: input.asset,
    network: input.network,
    amountMinor: String(input.amountMinor),
  };
  return createHash("sha256").update(canonical(payload)).digest("hex");
}

export function defaultSettlementApprovalPolicy(env: NodeJS.ProcessEnv = process.env): SettlementApprovalPolicy {
  const parsed = Number(env.DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED ?? "2");
  const requiredApprovals = Number.isInteger(parsed) && parsed >= 1 && parsed <= 10 ? parsed : 2;
  return {
    requiredApprovals,
    makerCheckerRequired: env.DIGITAL_ENERGY_MAKER_CHECKER_REQUIRED !== "false",
    allowedAssets: ["USDC", "EURC", "FIAT_EUR"],
    allowedNetworks: ["SOLANA", "OFFCHAIN"],
  };
}

export function assertSettlementProposalAllowed(input: SettlementReviewInput, policy: SettlementApprovalPolicy): void {
  if (!policy.allowedAssets.includes(input.asset)) throw new EnergyInvariantError("SETTLEMENT_ASSET_POLICY_DENIED", `Settlement asset ${input.asset} is not allowed`);
  if (!policy.allowedNetworks.includes(input.network)) throw new EnergyInvariantError("SETTLEMENT_NETWORK_POLICY_DENIED", `Settlement network ${input.network} is not allowed`);
  if (BigInt(input.amountMinor) <= 0n) throw new EnergyInvariantError("SETTLEMENT_AMOUNT_INVALID", "Settlement amount must be greater than zero");
}

export function evaluateSettlementControls(input: {
  settlement: SettlementReviewInput;
  createdBy: string;
  approvals: readonly SettlementApproval[];
  policy: SettlementApprovalPolicy;
}): SettlementControlStatus {
  const expectedHash = settlementReviewHash(input.settlement);
  const currentApprovals = input.approvals.filter(item => item.settlementId === input.settlement.settlementId && item.reviewHash === expectedHash);
  const rejectedBy = [...new Set(currentApprovals.filter(item => item.decision === "REJECTED").map(item => item.actorId))];
  const approvedBy = [...new Set(currentApprovals.filter(item => item.decision === "APPROVED").map(item => item.actorId))];
  const makerCheckerSatisfied = !input.policy.makerCheckerRequired || approvedBy.every(actorId => actorId !== input.createdBy);
  const state: ControlState = rejectedBy.length > 0
    ? "REJECTED"
    : approvedBy.length >= input.policy.requiredApprovals && makerCheckerSatisfied
      ? "APPROVED"
      : "PENDING";
  return {
    settlementId: input.settlement.settlementId,
    reviewHash: expectedHash,
    createdBy: input.createdBy,
    requiredApprovals: input.policy.requiredApprovals,
    approvedBy,
    rejectedBy,
    state,
    makerCheckerSatisfied,
  };
}

export function assertSettlementCanSubmit(status: SettlementControlStatus): void {
  if (status.state === "REJECTED") throw new EnergyInvariantError("SETTLEMENT_REJECTED", "Settlement has been rejected by institutional controls");
  if (status.state !== "APPROVED") throw new EnergyInvariantError("SETTLEMENT_APPROVAL_REQUIRED", `Settlement requires ${status.requiredApprovals} valid approval(s)`);
  if (!status.makerCheckerSatisfied) throw new EnergyInvariantError("SETTLEMENT_MAKER_CHECKER_REQUIRED", "Settlement maker cannot satisfy checker approval requirements");
}
