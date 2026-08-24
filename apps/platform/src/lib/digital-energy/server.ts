import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { PostgresDigitalEnergyRepository } from "@powerchain/database";
import {
  createDemoDigitalEnergySnapshot,
  DigitalEnergyMemoryStore,
  serializeDigitalEnergy,
  type DigitalEnergyPositionBacking,
  type DigitalEnergySnapshot,
} from "@powerchain/digital-energy";
import type { EnergyRepresentationNetwork } from "@powerchain/energy-rwa";
import type { EnergyRetirementReason } from "@powerchain/energy-core";
import { getSession } from "@/lib/auth/sessions";
import { listAudit as listMemoryAudit, writeAudit as writeMemoryAudit } from "@/lib/audit/logger";
import { SESSION_COOKIE, securityHeaders } from "@/lib/security/security";

export interface DigitalEnergyRequestContext {
  organizationId: string;
  userId: string;
  role: string;
  accessMode: "SESSION" | "TRUSTED_SERVICE" | "DEMO" | "UNAUTHENTICATED";
  requestId: string;
  correlationId: string;
  dataMode: "DEMO" | "LIVE" | "DEGRADED";
}

type CreatePositionInput = { id:string;batchId:string;ownerId:string;amountWh:string;idempotencyKey:string };
type ReserveInput = { positionId:string;reservationId:string;amountWh:string;purpose:string;idempotencyKey:string };
type ReleaseReservationInput = { reservationId:string;idempotencyKey:string };
type RepresentInput = { positionId:string;representationId:string;network:EnergyRepresentationNetwork;reference:string;amountWh:string;idempotencyKey:string };
type RetireRepresentationInput = { representationId:string;idempotencyKey:string };
type RetirePositionInput = { positionId:string;retirementId:string;reason:EnergyRetirementReason;idempotencyKey:string };

const globalStore = globalThis as unknown as {
  digitalEnergyStores?: Map<string, DigitalEnergyMemoryStore>;
  digitalEnergyRateLimits?: Map<string, number[]>;
  digitalEnergyRepository?: PostgresDigitalEnergyRepository;
};

globalStore.digitalEnergyStores ??= new Map();
globalStore.digitalEnergyRateLimits ??= new Map();
globalStore.digitalEnergyRepository ??= new PostgresDigitalEnergyRepository();

function trustedServiceContext(request:Request):{organizationId:string;userId:string;role:"service"}|null{
  if(process.env.DIGITAL_ENERGY_TRUST_SERVICE_HEADERS!=="true")return null;
  const secret=String(process.env.DIGITAL_ENERGY_SERVICE_HMAC_SECRET??"").trim();
  if(!secret)return null;

  const organizationId=request.headers.get("x-organization-id")?.trim();
  const serviceName=request.headers.get("x-powerchain-service-role")?.trim();
  const claimedUser=request.headers.get("x-user-id")?.trim()??"";
  const timestamp=request.headers.get("x-powerchain-service-timestamp")?.trim();
  const supplied=request.headers.get("x-powerchain-service-signature")?.trim().replace(/^sha256=/,"");

  if(!organizationId||!serviceName||!timestamp||!supplied||!/^[a-f0-9]{64}$/i.test(supplied))return null;

  const epochSeconds=Number(timestamp);
  if(!Number.isFinite(epochSeconds))return null;
  const configuredSkew=Number(process.env.DIGITAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS??300);
  const maxSkew=Number.isFinite(configuredSkew)?Math.max(30,Math.min(configuredSkew,900)):300;
  if(Math.abs(Math.floor(Date.now()/1000)-epochSeconds)>maxSkew)return null;

  const pathname=new URL(request.url).pathname;
  const canonical=[
    request.method.toUpperCase(),
    pathname,
    organizationId,
    serviceName,
    claimedUser,
    timestamp,
  ].join("\n");
  const expected=createHmac("sha256",secret).update(canonical).digest();
  const actual=Buffer.from(supplied,"hex");
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;

  return{
    organizationId,
    userId:claimedUser||`service:${serviceName}`,
    role:"service",
  };
}

export async function getDigitalEnergyContext(request: Request): Promise<DigitalEnergyRequestContext> {
  const jar = await cookies();
  const session = getSession(jar.get(SESSION_COOKIE)?.value);
  const live = databaseConfigured();
  const trustedService = trustedServiceContext(request);
  const demoOrganizationId = request.headers.get("x-organization-id")?.trim() || "org_powerchain_demo";
  const organizationId = session?.user.organizationId
    ?? trustedService?.organizationId
    ?? (!live ? demoOrganizationId : "org_unauthenticated");
  const userId = session?.user.id
    ?? trustedService?.userId
    ?? (!live ? request.headers.get("x-user-id")?.trim() || "user_demo" : "user_unauthenticated");
  const role = session?.user.role ?? trustedService?.role ?? (!live ? "demo" : "unauthenticated");
  const accessMode: DigitalEnergyRequestContext["accessMode"] = session
    ? "SESSION"
    : trustedService
      ? "TRUSTED_SERVICE"
      : live
        ? "UNAUTHENTICATED"
        : "DEMO";
  const requestId = request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const correlationId = request.headers.get("x-correlation-id")?.trim() || requestId;
  return { organizationId, userId, role, accessMode, requestId, correlationId, dataMode: live ? "LIVE" : "DEMO" };
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function demoFallbackEnabled(): boolean {
  return process.env.DIGITAL_ENERGY_ALLOW_DEMO_FALLBACK === "true";
}

function repository(): PostgresDigitalEnergyRepository {
  return globalStore.digitalEnergyRepository!;
}

function databaseUnavailable(error: unknown): never {
  const wrapped = new Error(error instanceof Error ? error.message : "Digital Energy database unavailable") as Error & { code:string };
  wrapped.name = "DIGITAL_ENERGY_DATABASE_UNAVAILABLE";
  wrapped.code = "DIGITAL_ENERGY_DATABASE_UNAVAILABLE";
  throw wrapped;
}

function getDemoStore(organizationId: string): DigitalEnergyMemoryStore {
  const existing = globalStore.digitalEnergyStores!.get(organizationId);
  if (existing) return existing;
  const store = new DigitalEnergyMemoryStore(createDemoDigitalEnergySnapshot(organizationId));
  globalStore.digitalEnergyStores!.set(organizationId, store);
  return store;
}

export async function getDigitalEnergySnapshot(context: DigitalEnergyRequestContext): Promise<DigitalEnergySnapshot> {
  if (!databaseConfigured()) {
    context.dataMode = "DEMO";
    return getDemoStore(context.organizationId).snapshot(context.organizationId, "DEMO");
  }
  try {
    const snapshot = await repository().snapshot(context.organizationId);
    context.dataMode = "LIVE";
    return snapshot;
  } catch (error) {
    if (!demoFallbackEnabled()) databaseUnavailable(error);
    context.dataMode = "DEGRADED";
    return getDemoStore(context.organizationId).snapshot(context.organizationId, "DEGRADED");
  }
}

export async function writeDigitalEnergyAudit(context: DigitalEnergyRequestContext, event: {action:string;resource:string;resourceId?:string;metadata?:Record<string,unknown>}) {
  const metadata={...(event.metadata??{})};
  if(databaseConfigured()){
    return repository().writeAudit({
      action:event.action,actorId:context.userId,organizationId:context.organizationId,resource:event.resource,
      ...(event.resourceId?{resourceId:event.resourceId}:{}),requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode,metadata,
    });
  }
  return writeMemoryAudit({
    action:event.action,actorId:context.userId,organizationId:context.organizationId,resource:event.resource,
    ...(event.resourceId?{resourceId:event.resourceId}:{}),metadata:{requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode,...metadata},
  });
}

export async function listDigitalEnergyAudit(context:DigitalEnergyRequestContext,limit=100){
  if(databaseConfigured()){
    context.dataMode="LIVE";
    try{return await repository().listAudit(context.organizationId,limit)}catch(error){if(!demoFallbackEnabled())databaseUnavailable(error);context.dataMode="DEGRADED"}
  }
  const events=await listMemoryAudit(Math.max(limit,250));
  return events.filter(event=>event.organizationId===context.organizationId).slice(0,limit);
}

async function persistentWrite<T>(context: DigitalEnergyRequestContext, live:()=>Promise<T>, demo:()=>T):Promise<T>{
  if (!databaseConfigured()) {
    context.dataMode = "DEMO";
    return demo();
  }
  context.dataMode = "LIVE";
  try {
    return await live();
  } catch (error) {
    // Economic writes never fall back from a configured database to the demo store.
    if (error && typeof error === "object" && "code" in error) throw error;
    databaseUnavailable(error);
  }
}

export async function createDigitalEnergyPosition(context:DigitalEnergyRequestContext,input:CreatePositionInput){
  const data=await persistentWrite(context,
    ()=>repository().createPosition({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).createPosition({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.position.created",resource:"energy-position",resourceId:input.id,metadata:{batchId:input.batchId,amountWh:input.amountWh}});
  return data;
}

export async function reserveDigitalEnergyPosition(context:DigitalEnergyRequestContext,input:ReserveInput){
  const data=await persistentWrite(context,
    ()=>repository().reserve({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).reserve({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.position.reserved",resource:"energy-reservation",resourceId:input.reservationId,metadata:{positionId:input.positionId,amountWh:input.amountWh,purpose:input.purpose}});
  return data;
}

export async function releaseDigitalEnergyReservation(context:DigitalEnergyRequestContext,input:ReleaseReservationInput){
  const data=await persistentWrite(context,
    ()=>repository().releaseReservation({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).releaseReservation({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.reservation.released",resource:"energy-reservation",resourceId:input.reservationId});
  return data;
}

export async function representDigitalEnergyPosition(context:DigitalEnergyRequestContext,input:RepresentInput){
  const data=await persistentWrite(context,
    ()=>repository().represent({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).represent({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.representation.created",resource:"energy-representation",resourceId:input.representationId,metadata:{positionId:input.positionId,network:input.network,reference:input.reference,amountWh:input.amountWh}});
  return data;
}

export async function retireDigitalEnergyRepresentation(context:DigitalEnergyRequestContext,input:RetireRepresentationInput){
  const data=await persistentWrite(context,
    ()=>repository().retireRepresentation({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).retireRepresentation({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.representation.retired",resource:"energy-representation",resourceId:input.representationId});
  return data;
}

export async function retireDigitalEnergyPosition(context:DigitalEnergyRequestContext,input:RetirePositionInput){
  const data=await persistentWrite(context,
    ()=>repository().retirePosition({organizationId:context.organizationId,...input}),
    ()=>getDemoStore(context.organizationId).retirePosition({organizationId:context.organizationId,...input}));
  await writeDigitalEnergyAudit(context,{action:"digital-energy.position.retired",resource:"energy-position",resourceId:input.positionId,metadata:{retirementId:input.retirementId,reason:input.reason}});
  return data;
}

export async function getDigitalEnergyPositionBacking(context:DigitalEnergyRequestContext,positionId:string):Promise<DigitalEnergyPositionBacking>{
  if (!databaseConfigured()) {
    context.dataMode="DEMO";
    return getDemoStore(context.organizationId).positionBacking(context.organizationId,positionId);
  }
  try {
    const backing=await repository().getPositionBacking(context.organizationId,positionId);
    context.dataMode="LIVE";
    return backing;
  } catch(error) {
    if (!demoFallbackEnabled()) databaseUnavailable(error);
    context.dataMode="DEGRADED";
    return getDemoStore(context.organizationId).positionBacking(context.organizationId,positionId);
  }
}

export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key || key.length < 8 || key.length > 160) {
    const error = new Error("Economic writes require Idempotency-Key (8–160 characters)") as Error & {code:string};
    error.name = "IDEMPOTENCY_KEY_REQUIRED";
    error.code = "IDEMPOTENCY_KEY_REQUIRED";
    throw error;
  }
  return key;
}

export function enforceDigitalEnergyRateLimit(request: Request, context: DigitalEnergyRequestContext, write = false): void {
  if (databaseConfigured() && context.accessMode === "UNAUTHENTICATED") {
    const error = new Error("Live Digital Energy tenant data requires an authenticated session or explicitly trusted service context") as Error & {code:string};
    error.name = "DIGITAL_ENERGY_AUTH_REQUIRED";
    error.code = "DIGITAL_ENERGY_AUTH_REQUIRED";
    throw error;
  }
  if (write && databaseConfigured() && !["prosumer", "company", "admin", "super-admin", "service"].includes(context.role)) {
    const error = new Error("Live Digital Energy economic writes require an authorized operator session or explicitly trusted service context") as Error & {code:string};
    error.name = "DIGITAL_ENERGY_WRITE_FORBIDDEN";
    error.code = "DIGITAL_ENERGY_WRITE_FORBIDDEN";
    throw error;
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `${forwarded ?? "local"}:${context.organizationId}:${write ? "write" : "read"}`;
  const now = Date.now();
  const windowMs = 60_000;
  const limit = write ? 90 : 600;
  const recent = (globalStore.digitalEnergyRateLimits!.get(key) ?? []).filter((value) => value > now - windowMs);
  if (recent.length >= limit) {
    const error = new Error("Digital Energy API rate limit exceeded") as Error & {code:string};
    error.name = "RATE_LIMITED";
    error.code = "RATE_LIMITED";
    throw error;
  }
  recent.push(now);
  globalStore.digitalEnergyRateLimits!.set(key, recent);
}

export function digitalEnergyResponse(data: unknown, context: DigitalEnergyRequestContext, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  headers.set("x-request-id", context.requestId);
  headers.set("x-correlation-id", context.correlationId);
  headers.set("x-powerchain-data-mode", context.dataMode);
  return Response.json({
    data: serializeDigitalEnergy(data),
    meta: {
      requestId: context.requestId,
      correlationId: context.correlationId,
      organizationId: context.organizationId,
      accessMode: context.accessMode,
      dataMode: context.dataMode,
      observedAt: new Date().toISOString(),
    },
  }, { ...init, headers });
}

export function digitalEnergyError(error: unknown, context: DigitalEnergyRequestContext): Response {
  const code = error && typeof error === "object" && "code" in error ? String((error as {code?:unknown}).code ?? "DIGITAL_ENERGY_ERROR") : error instanceof Error ? error.name || "DIGITAL_ENERGY_ERROR" : "DIGITAL_ENERGY_ERROR";
  const message = error instanceof Error ? error.message : "Digital Energy request failed";
  const status = code === "RATE_LIMITED" ? 429
    : code === "DIGITAL_ENERGY_DATABASE_UNAVAILABLE" ? 503
    : code === "DIGITAL_ENERGY_AUTH_REQUIRED" ? 401
    : code === "IDEMPOTENCY_KEY_REQUIRED" ? 400
    : code === "DIGITAL_ENERGY_WRITE_FORBIDDEN" ? 403
    : code === "DIGITAL_ENERGY_APPROVAL_FORBIDDEN" ? 403
    : code === "DIGITAL_ENERGY_SETTLEMENT_EXECUTION_FORBIDDEN" ? 403
    : code.includes("NOT_FOUND") ? 404
    : code.includes("OVERISSUANCE") || code.includes("BACKING") || code.includes("ACTIVE_") || code.includes("RESERVATION_NOT_ACTIVE") ? 409
    : 400;
  const headers = new Headers(securityHeaders);
  headers.set("x-request-id", context.requestId);
  headers.set("x-correlation-id", context.correlationId);
  headers.set("x-powerchain-data-mode", context.dataMode);
  return Response.json({ error: { code, message, requestId: context.requestId } }, { status, headers });
}


export function requireDigitalEnergySettlementApprover(context:DigitalEnergyRequestContext):void{
  if(context.dataMode!=="DEMO"&&!["company","admin","super-admin","service"].includes(context.role)){
    const error=new Error("Settlement approval requires company, admin, super-admin, or trusted service checker authority") as Error & {code:string};
    error.name="DIGITAL_ENERGY_APPROVAL_FORBIDDEN";
    error.code="DIGITAL_ENERGY_APPROVAL_FORBIDDEN";
    throw error;
  }
}

export function requireDigitalEnergySettlementExecutor(context:DigitalEnergyRequestContext):void{
  if(context.dataMode!=="DEMO"&&!["company","admin","super-admin","service"].includes(context.role)){
    const error=new Error("Financial settlement preparation and execution requires company, admin, super-admin, or trusted service authority") as Error & {code:string};
    error.name="DIGITAL_ENERGY_SETTLEMENT_EXECUTION_FORBIDDEN";
    error.code="DIGITAL_ENERGY_SETTLEMENT_EXECUTION_FORBIDDEN";
    throw error;
  }
}
