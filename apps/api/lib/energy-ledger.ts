import { createDomainEvent } from "@powerchain/events";
import { getPrismaClient } from "@powerchain/database";
import { issuePosition as calculatePosition } from "@powerchain/energy-rwa";
import type { RequestContext } from "@powerchain/contracts";
import type { CreateBatchInput, CreateEnergyProofInput, IssuePositionInput, PositionAmountInput } from "@powerchain/validation";
import type { RequestActor } from "./identity";

function conflict(message: string, code = "CONFLICT"): never {
  throw Object.assign(new Error(message), { code, status: 409 });
}
function notFound(message: string): never {
  throw Object.assign(new Error(message), { code: "NOT_FOUND", status: 404 });
}

async function writeAudit(tx: any, input: { context: RequestContext; actor: RequestActor; action: string; resourceType: string; resourceId: string; metadata?: Record<string, unknown> }) {
  await tx.auditLog.create({ data: {
    organizationId: input.context.organizationId,
    actorId: input.actor.id,
    actorRole: input.actor.role,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    requestId: input.context.requestId,
    correlationId: input.context.correlationId,
    outcome: "SUCCESS",
    metadata: input.metadata,
  }});
}

async function writeEvent(tx: any, input: { context: RequestContext; type: string; aggregateType: string; aggregateId: string; payload: Record<string, unknown> }) {
  const event = createDomainEvent({ type: input.type, aggregateType: input.aggregateType, aggregateId: input.aggregateId, payload: input.payload, context: input.context });
  await tx.domainEventOutbox.create({ data: {
    id: event.id,
    type: event.type,
    version: event.version,
    occurredAt: new Date(event.occurredAt),
    organizationId: event.organizationId,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    requestId: event.requestId,
    correlationId: event.correlationId,
    causationId: event.causationId,
    payload: event.payload,
  }});
}

export async function listEnergyProofs(organizationId: string) {
  return getPrismaClient().energyProof.findMany({ where: { organizationId }, orderBy: { intervalStart: "desc" }, take: 100 });
}

export async function createEnergyProof(context: RequestContext, actor: RequestActor, input: CreateEnergyProofInput) {
  const organizationId = context.organizationId!;
  return getPrismaClient().$transaction(async tx => {
    const duplicate = await tx.energyProof.findFirst({ where: { organizationId, evidenceRoot: input.evidenceRoot } });
    if (duplicate) conflict("An Energy Proof already exists for this evidence root", "ENERGY_PROOF_DUPLICATE");
    const proof = await tx.energyProof.create({ data: { organizationId, ...input } });
    await writeAudit(tx, { context, actor, action: "energy.proof.create", resourceType: "EnergyProof", resourceId: proof.id });
    await writeEvent(tx, { context, type: "energy.proof.created.v1", aggregateType: "EnergyProof", aggregateId: proof.id, payload: { siteId: proof.siteId, meterId: proof.meterId, verifiedWh: proof.verifiedWh.toString(), evidenceRoot: proof.evidenceRoot } });
    return proof;
  });
}

export async function listEnergyBatches(organizationId: string) {
  return getPrismaClient().energyBatch.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function createEnergyBatch(context: RequestContext, actor: RequestActor, input: CreateBatchInput) {
  const organizationId = context.organizationId!;
  return getPrismaClient().$transaction(async tx => {
    const proof = await tx.energyProof.findFirst({ where: { id: input.proofId, organizationId } });
    if (!proof) notFound("Energy Proof not found in organization scope");
    const existing = await tx.energyBatch.findUnique({ where: { proofId: proof.id } });
    if (existing) return existing;
    const batch = await tx.energyBatch.create({ data: {
      organizationId,
      proofId: proof.id,
      verifiedWh: proof.verifiedWh,
      source: proof.source,
      evidenceRoot: proof.evidenceRoot,
    }});
    await writeAudit(tx, { context, actor, action: "energy.batch.create", resourceType: "EnergyBatch", resourceId: batch.id });
    await writeEvent(tx, { context, type: "energy.batch.created.v1", aggregateType: "EnergyBatch", aggregateId: batch.id, payload: { proofId: proof.id, verifiedWh: batch.verifiedWh.toString(), source: batch.source } });
    return batch;
  }, { isolationLevel: "Serializable" });
}

export async function listEnergyPositions(organizationId: string) {
  return getPrismaClient().energyPosition.findMany({ where: { batch: { organizationId } }, include: { batch: { select: { source: true, evidenceRoot: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function createEnergyPosition(context: RequestContext, actor: RequestActor, input: IssuePositionInput) {
  const organizationId = context.organizationId!;
  return getPrismaClient().$transaction(async tx => {
    const batch = await tx.energyBatch.findFirst({ where: { id: input.batchId, organizationId } });
    if (!batch) notFound("Energy Batch not found in organization scope");
    calculatePosition({
      id: batch.id,
      verifiedWh: batch.verifiedWh,
      invalidatedWh: batch.invalidatedWh,
      positionedWh: batch.positionedWh,
      retiredWh: batch.retiredWh,
      source: batch.source,
      evidenceRoot: batch.evidenceRoot,
    }, { id: "preflight", amountWh: input.amountWh, unit: input.unit, chain: input.canonicalChain });
    const updated = await tx.energyBatch.updateMany({
      where: { id: batch.id, positionedWh: batch.positionedWh },
      data: { positionedWh: { increment: input.amountWh } },
    });
    if (updated.count !== 1) conflict("Energy Batch changed during issuance; retry with the same idempotency key", "ENERGY_BATCH_CONCURRENT_UPDATE");
    const position = await tx.energyPosition.create({ data: {
      batchId: batch.id,
      unit: input.unit,
      amountWh: input.amountWh,
      canonicalChain: input.canonicalChain,
    }});
    await writeAudit(tx, { context, actor, action: "energy.position.create", resourceType: "EnergyPosition", resourceId: position.id, metadata: { batchId: batch.id, amountWh: input.amountWh.toString(), unit: input.unit } });
    await writeEvent(tx, { context, type: "energy.position.created.v1", aggregateType: "EnergyPosition", aggregateId: position.id, payload: { batchId: batch.id, amountWh: input.amountWh.toString(), unit: input.unit } });
    return position;
  }, { isolationLevel: "Serializable" });
}

export async function listEnergyReservations(organizationId: string) {
  return getPrismaClient().energyReservation.findMany({ where: { position: { batch: { organizationId } } }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function reserveEnergyPosition(context: RequestContext, actor: RequestActor, input: PositionAmountInput) {
  const organizationId = context.organizationId!;
  return getPrismaClient().$transaction(async tx => {
    const position = await tx.energyPosition.findFirst({ where: { id: input.positionId, batch: { organizationId } } });
    if (!position) notFound("Energy Position not found in organization scope");
    const available = position.amountWh - position.retiredWh - position.reservedWh;
    if (input.amountWh > available) conflict("Insufficient available Energy RWA quantity", "INSUFFICIENT_ENERGY_RWA_AVAILABLE");
    const updated = await tx.energyPosition.updateMany({
      where: { id: position.id, reservedWh: position.reservedWh, retiredWh: position.retiredWh },
      data: { reservedWh: { increment: input.amountWh }, state: "RESERVED" },
    });
    if (updated.count !== 1) conflict("Energy Position changed during reservation; retry", "ENERGY_POSITION_CONCURRENT_UPDATE");
    const reservation = await tx.energyReservation.create({ data: { positionId: position.id, amountWh: input.amountWh, orderId: input.orderId } });
    await writeAudit(tx, { context, actor, action: "energy.position.reserve", resourceType: "EnergyReservation", resourceId: reservation.id, metadata: { positionId: position.id, amountWh: input.amountWh.toString() } });
    await writeEvent(tx, { context, type: "energy.position.reserved.v1", aggregateType: "EnergyPosition", aggregateId: position.id, payload: { reservationId: reservation.id, amountWh: input.amountWh.toString() } });
    return reservation;
  }, { isolationLevel: "Serializable" });
}

export async function listEnergyRetirements(organizationId: string) {
  return getPrismaClient().energyRetirement.findMany({ where: { position: { batch: { organizationId } } }, orderBy: { retiredAt: "desc" }, take: 100 });
}

export async function retireEnergyPosition(context: RequestContext, actor: RequestActor, input: PositionAmountInput) {
  const organizationId = context.organizationId!;
  return getPrismaClient().$transaction(async tx => {
    const position = await tx.energyPosition.findFirst({ where: { id: input.positionId, batch: { organizationId } } });
    if (!position) notFound("Energy Position not found in organization scope");
    if (position.retiredWh + input.amountWh > position.amountWh) conflict("Retirement exceeds Energy Position backing", "ENERGY_RETIREMENT_EXCEEDS_POSITION");
    const nextRetired = position.retiredWh + input.amountWh;
    const nextReserved = position.reservedWh > input.amountWh ? position.reservedWh - input.amountWh : 0n;
    const updated = await tx.energyPosition.updateMany({
      where: { id: position.id, retiredWh: position.retiredWh, reservedWh: position.reservedWh },
      data: { retiredWh: nextRetired, reservedWh: nextReserved, state: nextRetired === position.amountWh ? "RETIRED" : position.state },
    });
    if (updated.count !== 1) conflict("Energy Position changed during retirement; retry", "ENERGY_POSITION_CONCURRENT_UPDATE");
    await tx.energyBatch.update({ where: { id: position.batchId }, data: { retiredWh: { increment: input.amountWh } } });
    const retirement = await tx.energyRetirement.create({ data: {
      positionId: position.id,
      amountWh: input.amountWh,
      reason: input.reason ?? "SETTLED",
      settlementId: input.settlementId,
    }});
    await writeAudit(tx, { context, actor, action: "energy.position.retire", resourceType: "EnergyRetirement", resourceId: retirement.id, metadata: { positionId: position.id, amountWh: input.amountWh.toString(), reason: retirement.reason } });
    await writeEvent(tx, { context, type: "energy.position.retired.v1", aggregateType: "EnergyPosition", aggregateId: position.id, payload: { retirementId: retirement.id, amountWh: input.amountWh.toString(), reason: retirement.reason } });
    return retirement;
  }, { isolationLevel: "Serializable" });
}
