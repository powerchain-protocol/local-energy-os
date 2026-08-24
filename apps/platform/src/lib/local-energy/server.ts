import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  PostgresLocalEnergyRepository,
} from "@powerchain/database/local-energy";
import {
  assertGridConstrainedCommitment,
  assertLocalEnergyOrderTransition,
  assertMeterEvidence,
  calculateLocalEnergyPricing,
  kwhToWh,
  reconcileLocalEnergyDelivery,
  whToKwh,
  type LocalEnergyListingMode,
  type LocalEnergyListingRecord,
  type LocalEnergyOrderAction,
  type LocalEnergyOrderRecord,
  type LocalEnergyOrderState,
  type LocalEnergySettlementAsset,
  type LocalEnergySource,
} from "@powerchain/local-energy";
import { energyCommunitySummary, localEnergyListings, demoP2POrders } from "@/data/p2p-energy";
import { getSession } from "@/lib/auth/sessions";
import { SESSION_COOKIE, securityHeaders } from "@/lib/security/security";

export interface LocalEnergyRequestContext {
  organizationId:string;
  userId:string;
  role:string;
  accessMode:"SESSION"|"TRUSTED_SERVICE"|"DEMO"|"UNAUTHENTICATED";
  requestId:string;
  correlationId:string;
  dataMode:"DEMO"|"LIVE"|"DEGRADED";
}

type CanonicalListing=LocalEnergyListingRecord&{
  latitude?:number;
  longitude?:number;
  metadata:Record<string,unknown>;
  createdAt:Date;
  updatedAt:Date;
};
type CanonicalOrder=LocalEnergyOrderRecord&{idempotencyKey?:string;toleranceWh:bigint};

const globalStore=globalThis as unknown as {
  localEnergyRepository?:PostgresLocalEnergyRepository;
  localEnergyListings?:Map<string,Map<string,CanonicalListing>>;
  localEnergyOrders?:Map<string,Map<string,CanonicalOrder>>;
  localEnergyIdempotency?:Map<string,string>;
  localEnergyFlex?:Map<string,Map<string,Record<string,unknown>>>;
  localEnergyRateLimits?:Map<string,number[]>;
};
globalStore.localEnergyRepository??=new PostgresLocalEnergyRepository();
globalStore.localEnergyListings??=new Map();
globalStore.localEnergyOrders??=new Map();
globalStore.localEnergyIdempotency??=new Map();
globalStore.localEnergyFlex??=new Map();
globalStore.localEnergyRateLimits??=new Map();

export function localEnergyDatabaseConfigured(){
  return Boolean(process.env.DATABASE_URL?.trim());
}

function trustedServiceContext(request:Request):{organizationId:string;userId:string;role:"service"}|null{
  if(process.env.LOCAL_ENERGY_TRUST_SERVICE_HEADERS!=="true")return null;
  const secret=String(process.env.LOCAL_ENERGY_SERVICE_HMAC_SECRET??"").trim();
  if(!secret)return null;
  const organizationId=request.headers.get("x-organization-id")?.trim();
  const serviceName=request.headers.get("x-powerchain-service-role")?.trim();
  const claimedUser=request.headers.get("x-user-id")?.trim()??"";
  const timestamp=request.headers.get("x-powerchain-service-timestamp")?.trim();
  const supplied=request.headers.get("x-powerchain-service-signature")?.trim().replace(/^sha256=/,"");
  if(!organizationId||!serviceName||!timestamp||!supplied||!/^[a-f0-9]{64}$/i.test(supplied))return null;
  const epochSeconds=Number(timestamp);
  if(!Number.isFinite(epochSeconds))return null;
  const configured=Number(process.env.LOCAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS??300);
  const maxSkew=Number.isFinite(configured)?Math.max(30,Math.min(configured,900)):300;
  if(Math.abs(Math.floor(Date.now()/1000)-epochSeconds)>maxSkew)return null;
  const pathname=new URL(request.url).pathname;
  const canonical=[request.method.toUpperCase(),pathname,organizationId,serviceName,claimedUser,timestamp].join("\n");
  const expected=createHmac("sha256",secret).update(canonical).digest();
  const actual=Buffer.from(supplied,"hex");
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
  return{organizationId,userId:claimedUser||`service:${serviceName}`,role:"service"};
}

export async function getLocalEnergyContext(request:Request):Promise<LocalEnergyRequestContext>{
  const jar=await cookies();
  const session=getSession(jar.get(SESSION_COOKIE)?.value);
  const live=localEnergyDatabaseConfigured();
  const service=trustedServiceContext(request);
  const organizationId=session?.user.organizationId??service?.organizationId??(!live?(request.headers.get("x-organization-id")?.trim()||"org_powerchain_demo"):"org_unauthenticated");
  const userId=session?.user.id??service?.userId??(!live?(request.headers.get("x-user-id")?.trim()||"user_demo"):"user_unauthenticated");
  const role=session?.user.role??service?.role??(!live?"demo":"unauthenticated");
  const accessMode:LocalEnergyRequestContext["accessMode"]=session?"SESSION":service?"TRUSTED_SERVICE":live?"UNAUTHENTICATED":"DEMO";
  const requestId=request.headers.get("x-request-id")?.trim()||crypto.randomUUID();
  const correlationId=request.headers.get("x-correlation-id")?.trim()||requestId;
  return{organizationId,userId,role,accessMode,requestId,correlationId,dataMode:live?"LIVE":"DEMO"};
}

export function requireLocalEnergyAccess(context:LocalEnergyRequestContext,write=false){
  if(localEnergyDatabaseConfigured()&&context.accessMode==="UNAUTHENTICATED"){
    throw Object.assign(new Error("Live Local Energy tenant data requires an authenticated session or signed trusted-service context"),{code:"LOCAL_ENERGY_AUTH_REQUIRED"});
  }
  if(write&&localEnergyDatabaseConfigured()&&!["prosumer","company","admin","super-admin","service"].includes(context.role)){
    throw Object.assign(new Error("Local Energy economic writes require an authorized operator"),{code:"LOCAL_ENERGY_WRITE_FORBIDDEN"});
  }
}

export function requireLocalEnergyIdempotencyKey(request:Request){
  const key=request.headers.get("idempotency-key")?.trim();
  if(!key||key.length<8||key.length>160)throw Object.assign(new Error("Local Energy economic writes require Idempotency-Key (8–160 characters)"),{code:"LOCAL_ENERGY_IDEMPOTENCY_KEY_REQUIRED"});
  return key;
}

export function enforceLocalEnergyRateLimit(request:Request,context:LocalEnergyRequestContext,write=false){
  requireLocalEnergyAccess(context,write);
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"local";
  const key=`${forwarded}:${context.organizationId}:${write?"write":"read"}`;
  const now=Date.now(),windowMs=60_000,limit=write?90:600;
  const recent=(globalStore.localEnergyRateLimits!.get(key)??[]).filter(item=>item>now-windowMs);
  if(recent.length>=limit)throw Object.assign(new Error("Local Energy API rate limit exceeded"),{code:"LOCAL_ENERGY_RATE_LIMITED"});
  recent.push(now);
  globalStore.localEnergyRateLimits!.set(key,recent);
}

function serialize(value:unknown):unknown{
  if(typeof value==="bigint")return value.toString();
  if(value instanceof Date)return value.toISOString();
  if(Array.isArray(value))return value.map(serialize);
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,serialize(v)]));
  return value;
}

export function localEnergyResponse(data:unknown,context:LocalEnergyRequestContext,init:ResponseInit={}){
  const headers=new Headers(init.headers);
  for(const[key,value]of Object.entries(securityHeaders))headers.set(key,value);
  headers.set("x-request-id",context.requestId);
  headers.set("x-correlation-id",context.correlationId);
  headers.set("x-powerchain-data-mode",context.dataMode);
  return Response.json({data:serialize(data),meta:{requestId:context.requestId,correlationId:context.correlationId,organizationId:context.organizationId,accessMode:context.accessMode,dataMode:context.dataMode,observedAt:new Date().toISOString()}},{...init,headers});
}

export function localEnergyError(error:unknown,context:LocalEnergyRequestContext){
  const rawCode=error&&typeof error==="object"&&"code" in error?String((error as{code?:unknown}).code):error instanceof Error?error.message:"LOCAL_ENERGY_ERROR";
  const databaseFailure=localEnergyDatabaseConfigured()&&!rawCode.startsWith("LOCAL_ENERGY_");
  const code=databaseFailure?"LOCAL_ENERGY_DATABASE_UNAVAILABLE":rawCode;
  const message=databaseFailure?"Local Energy database is unavailable":error instanceof Error?error.message:"Local Energy request failed";
  const status=code==="LOCAL_ENERGY_DATABASE_UNAVAILABLE"?503:
    code==="LOCAL_ENERGY_RATE_LIMITED"?429:
    code==="LOCAL_ENERGY_AUTH_REQUIRED"?401:
    code==="LOCAL_ENERGY_WRITE_FORBIDDEN"?403:
    code.includes("NOT_FOUND")?404:
    code.includes("CONFLICT")||code.includes("EXCEED")||code.includes("TRANSITION")||code.includes("NOT_ACTIVE")||code.includes("EXPIRED")?409:400;
  const headers=new Headers(securityHeaders);
  headers.set("x-request-id",context.requestId);
  headers.set("x-correlation-id",context.correlationId);
  headers.set("x-powerchain-data-mode",context.dataMode);
  return Response.json({error:{code,message,requestId:context.requestId}},{status,headers});
}

function demoListings(organizationId:string){
  let store=globalStore.localEnergyListings!.get(organizationId);
  if(store)return store;
  store=new Map();
  const now=Date.now();
  for(const item of localEnergyListings){
    const settlementAsset:LocalEnergySettlementAsset=item.settlementAsset==="FIAT"?"FIAT_EUR":item.settlementAsset;
    const mode=item.mode.toUpperCase() as LocalEnergyListingMode;
    const source=item.source.toUpperCase() as LocalEnergySource;
    store.set(item.id,{
      id:item.id,organizationId,sellerOrganizationId:item.sellerId,sellerName:item.sellerName,title:item.title,mode,source,
      gridAreaId:`grid-${item.region.toLowerCase().replaceAll(" ","-")}`,location:item.location,latitude:item.coordinates.latitude,longitude:item.coordinates.longitude,
      quantityWh:kwhToWh(item.quantityKwh),availableWh:kwhToWh(item.availableKwh),minimumWh:kwhToWh(item.minimumKwh),
      priceMicrosPerKwh:BigInt(Math.round(item.pricePerKwh*1_000_000)),currency:item.currency,settlementAsset,
      renewablePercent:item.renewablePercent,verified:item.verified,meterVerified:item.meterVerified,
      deliveryStart:new Date(now-60*60_000),deliveryEnd:new Date(now+24*60*60_000),state:item.status==="active"?"ACTIVE":"PAUSED",
      metadata:{distanceKm:item.distanceKm,sellerRating:item.sellerRating,rental:item.rental??null,legacyDeliveryStart:item.deliveryStart,legacyDeliveryEnd:item.deliveryEnd},
      createdAt:new Date(now-24*60*60_000),updatedAt:new Date(now),
    });
  }
  globalStore.localEnergyListings!.set(organizationId,store);
  return store;
}

function demoOrders(organizationId:string){
  let store=globalStore.localEnergyOrders!.get(organizationId);
  if(store)return store;
  store=new Map();
  for(const item of demoP2POrders){
    const status:LocalEnergyOrderState=item.status==="settled"?"SETTLED":"DELIVERING";
    const quantityWh=kwhToWh(item.quantityKwh);
    store.set(item.id,{
      id:item.id,organizationId,listingId:item.listingId,buyerId:item.buyerId,quantityWh,expectedWh:quantityWh,deliveredWh:status==="SETTLED"?quantityWh:0n,varianceWh:0n,
      subtotalMicros:BigInt(Math.round(item.pricing.subtotal*1_000_000)),networkFeeMicros:BigInt(Math.round(item.pricing.networkFee*1_000_000)),
      reserveMicros:BigInt(Math.round(item.pricing.escrowReserve*1_000_000)),totalMicros:BigInt(Math.round(item.pricing.total*1_000_000)),
      currency:item.currency,settlementAsset:item.settlementAsset==="FIAT"?"FIAT_EUR":item.settlementAsset,state:status,
      ...(item.signature?{reservationReference:item.signature}:{}),...(item.meterReadingId?{meterEvidenceRoot:item.meterReadingId}:{}),
      ...(status==="SETTLED"?{settlementReference:`demo-settlement:${item.id}`}:{}),toleranceWh:0n,createdAt:new Date(item.createdAt),updatedAt:new Date(item.createdAt),
    });
  }
  globalStore.localEnergyOrders!.set(organizationId,store);
  return store;
}

export function publicLocalEnergyListing(item:CanonicalListing){
  const metadata=item.metadata??{};
  const rental=metadata.rental&&typeof metadata.rental==="object"?metadata.rental:undefined;
  return{
    id:item.id,sellerId:item.sellerOrganizationId,sellerName:item.sellerName,sellerRating:Number(metadata.sellerRating??5),
    mode:item.mode.toLowerCase(),source:item.source.toLowerCase(),title:item.title,location:item.location,
    region:item.gridAreaId.replace(/^grid-/,"").replaceAll("-"," "),coordinates:{latitude:item.latitude??0,longitude:item.longitude??0},
    distanceKm:Number(metadata.distanceKm??0),quantityKwh:whToKwh(item.quantityWh),availableKwh:whToKwh(item.availableWh),minimumKwh:whToKwh(item.minimumWh),
    pricePerKwh:Number(item.priceMicrosPerKwh)/1_000_000,currency:item.currency,
    deliveryStart:String(metadata.legacyDeliveryStart??item.deliveryStart.toISOString()),deliveryEnd:String(metadata.legacyDeliveryEnd??item.deliveryEnd.toISOString()),
    renewablePercent:item.renewablePercent,verified:item.verified,meterVerified:item.meterVerified,
    settlementAsset:item.settlementAsset==="FIAT_EUR"?"FIAT":item.settlementAsset,status:item.state==="ACTIVE"?"active":"paused",...(rental?{rental}:{}),
  };
}

export function publicLocalEnergyOrder(item:CanonicalOrder){
  return{
    id:item.id,listingId:item.listingId,buyerId:item.buyerId,quantityKwh:whToKwh(item.quantityWh),deliveredKwh:whToKwh(item.deliveredWh),
    varianceKwh:whToKwh(item.varianceWh),currency:item.currency,settlementAsset:item.settlementAsset==="FIAT_EUR"?"FIAT":item.settlementAsset,
    status:item.state.toLowerCase(),pricing:{
      subtotal:Number(item.subtotalMicros)/1_000_000,networkFee:Number(item.networkFeeMicros)/1_000_000,
      escrowReserve:Number(item.reserveMicros)/1_000_000,total:Number(item.totalMicros)/1_000_000,
    },
    meterReadingId:item.meterEvidenceRoot,signature:item.reservationReference,settlementReference:item.settlementReference,
    createdAt:item.createdAt.toISOString(),updatedAt:item.updatedAt.toISOString(),
  };
}

export async function listLocalEnergyListings(context:LocalEnergyRequestContext,input:{mode?:LocalEnergyListingMode;source?:LocalEnergySource;gridAreaId?:string}={}){
  if(localEnergyDatabaseConfigured()){
    context.dataMode="LIVE";
    return globalStore.localEnergyRepository!.listListings({organizationId:context.organizationId,...input});
  }
  context.dataMode="DEMO";
  return [...demoListings(context.organizationId).values()].filter(item=>(!input.mode||item.mode===input.mode)&&(!input.source||item.source===input.source)&&(!input.gridAreaId||item.gridAreaId===input.gridAreaId)&&item.state==="ACTIVE");
}

export async function createLocalEnergyOrder(context:LocalEnergyRequestContext,input:{listingId:string;quantityWh:bigint;idempotencyKey:string;toleranceWh?:bigint}){
  if(localEnergyDatabaseConfigured()){
    context.dataMode="LIVE";
    const data=await globalStore.localEnergyRepository!.createOrder({id:`leo_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,listingId:input.listingId,buyerId:context.userId,...input});
    await globalStore.localEnergyRepository!.writeAudit({organizationId:context.organizationId,actorId:context.userId,action:"local-energy.order.created",resource:"local-energy-order",resourceId:data.id,requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode,metadata:{listingId:input.listingId,quantityWh:input.quantityWh.toString()}});
    return data;
  }
  context.dataMode="DEMO";
  const idempotencyScope=`${context.organizationId}:${input.idempotencyKey}`;
  const existingId=globalStore.localEnergyIdempotency!.get(idempotencyScope);
  if(existingId){
    const replay=demoOrders(context.organizationId).get(existingId)!;
    if(replay.listingId!==input.listingId||replay.quantityWh!==input.quantityWh||replay.buyerId!==context.userId){
      throw Object.assign(new Error("Idempotency key was reused with a different Local Energy order payload"),{code:"LOCAL_ENERGY_IDEMPOTENCY_CONFLICT"});
    }
    return replay;
  }
  const listings=demoListings(context.organizationId);
  const source=listings.get(input.listingId);
  if(!source)throw Object.assign(new Error("Local Energy listing not found"),{code:"LOCAL_ENERGY_LISTING_NOT_FOUND"});
  if(input.quantityWh<source.minimumWh)throw Object.assign(new Error("Requested quantity is below the listing minimum"),{code:"LOCAL_ENERGY_BELOW_MINIMUM"});
  try{assertGridConstrainedCommitment({requestedWh:input.quantityWh,availableWh:source.availableWh,...(source.exportLimitWh!==undefined?{exportLimitWh:source.exportLimitWh}:{}),direction:source.mode==="BUY"?"IMPORT":"EXPORT"})}
  catch(error){throw Object.assign(error instanceof Error?error:new Error("Local Energy commitment rejected"),{code:error instanceof Error?error.message:"LOCAL_ENERGY_COMMITMENT_REJECTED"})}
  const pricing=calculateLocalEnergyPricing({quantityWh:input.quantityWh,priceMicrosPerKwh:source.priceMicrosPerKwh});
  const now=new Date();
  const created:CanonicalOrder={
    id:`leo_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,listingId:source.id,buyerId:context.userId,
    quantityWh:input.quantityWh,expectedWh:input.quantityWh,deliveredWh:0n,varianceWh:0n,...pricing,currency:source.currency,settlementAsset:source.settlementAsset,
    state:"REVIEW_REQUIRED",idempotencyKey:input.idempotencyKey,toleranceWh:input.toleranceWh??0n,createdAt:now,updatedAt:now,
  };
  source.availableWh-=input.quantityWh;source.updatedAt=now;
  demoOrders(context.organizationId).set(created.id,created);
  globalStore.localEnergyIdempotency!.set(idempotencyScope,created.id);
  return created;
}

export async function listLocalEnergyOrders(context:LocalEnergyRequestContext){
  if(localEnergyDatabaseConfigured()){context.dataMode="LIVE";return globalStore.localEnergyRepository!.listOrders(context.organizationId,100)}
  context.dataMode="DEMO";return [...demoOrders(context.organizationId).values()].sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime());
}

export async function getLocalEnergyOrder(context:LocalEnergyRequestContext,id:string){
  if(localEnergyDatabaseConfigured()){context.dataMode="LIVE";return globalStore.localEnergyRepository!.getOrder(context.organizationId,id)}
  context.dataMode="DEMO";return demoOrders(context.organizationId).get(id)??null;
}

export async function applyLocalEnergyOrderAction(context:LocalEnergyRequestContext,input:{id:string;action:LocalEnergyOrderAction;idempotencyKey:string;reservationReference?:string;deliveredWh?:bigint;meterEvidenceRoot?:string;toleranceWh?:bigint;settlementReference?:string}){
  if(localEnergyDatabaseConfigured()){
    context.dataMode="LIVE";
    const data=await globalStore.localEnergyRepository!.applyOrderAction({organizationId:context.organizationId,...input});
    await globalStore.localEnergyRepository!.writeAudit({organizationId:context.organizationId,actorId:context.userId,action:`local-energy.order.${input.action.toLowerCase()}`,resource:"local-energy-order",resourceId:data.id,requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode,metadata:{state:data.state}});
    return data;
  }
  context.dataMode="DEMO";
  const actionScope=`${context.organizationId}:order-action:${input.id}:${input.idempotencyKey}`;
  const priorAction=globalStore.localEnergyIdempotency!.get(actionScope);
  const store=demoOrders(context.organizationId);const current=store.get(input.id);
  if(priorAction&&current)return current;
  if(!current)throw Object.assign(new Error("Local Energy order not found"),{code:"LOCAL_ENERGY_ORDER_NOT_FOUND"});
  let next:LocalEnergyOrderState=current.state;
  let deliveredWh=current.deliveredWh,varianceWh=current.varianceWh,meterEvidenceRoot=current.meterEvidenceRoot,reservationReference=current.reservationReference,settlementReference=current.settlementReference,toleranceWh=input.toleranceWh??current.toleranceWh;
  switch(input.action){
    case"CONFIRM_RESERVATION":next="RESERVED";if(!input.reservationReference?.trim())throw Object.assign(new Error("External reservation reference is required"),{code:"LOCAL_ENERGY_RESERVATION_REFERENCE_REQUIRED"});reservationReference=input.reservationReference.trim();break;
    case"START_DELIVERY":next="DELIVERING";break;
    case"RECORD_DELIVERY":next="DELIVERED";deliveredWh=input.deliveredWh??0n;meterEvidenceRoot=input.meterEvidenceRoot?.trim();assertMeterEvidence({deliveredWh,meterEvidenceRoot});break;
    case"RECONCILE":next="RECONCILED";if(!current.meterEvidenceRoot)throw Object.assign(new Error("Meter evidence required"),{code:"LOCAL_ENERGY_METER_EVIDENCE_REQUIRED"});varianceWh=reconcileLocalEnergyDelivery({expectedWh:current.expectedWh,deliveredWh:current.deliveredWh,toleranceWh}).varianceWh;break;
    case"MARK_SETTLEMENT_READY":next="SETTLEMENT_READY";if(!current.meterEvidenceRoot||current.deliveredWh<=0n)throw Object.assign(new Error("Meter-evidenced delivery required"),{code:"LOCAL_ENERGY_METER_EVIDENCE_REQUIRED"});break;
    case"MARK_SETTLED":next="SETTLED";if(!input.settlementReference?.trim())throw Object.assign(new Error("External settlement reference is required"),{code:"LOCAL_ENERGY_SETTLEMENT_REFERENCE_REQUIRED"});settlementReference=input.settlementReference.trim();break;
    case"CANCEL":next="CANCELLED";break;
    case"DISPUTE":next="DISPUTED";break;
  }
  assertLocalEnergyOrderTransition(current.state,next);
  if(next==="CANCELLED"&&(current.state==="REVIEW_REQUIRED"||current.state==="RESERVED")){
    const listing=demoListings(context.organizationId).get(current.listingId);
    if(listing)listing.availableWh=listing.availableWh+current.quantityWh>listing.quantityWh?listing.quantityWh:listing.availableWh+current.quantityWh;
  }
  const updated={...current,state:next,deliveredWh,varianceWh,meterEvidenceRoot,reservationReference,settlementReference,toleranceWh,updatedAt:new Date()};
  store.set(current.id,updated);
  globalStore.localEnergyIdempotency!.set(actionScope,current.id);
  return updated;
}

export async function listLocalEnergyFlexibility(context:LocalEnergyRequestContext){
  if(localEnergyDatabaseConfigured()){context.dataMode="LIVE";return globalStore.localEnergyRepository!.listFlexibility(context.organizationId,100)}
  context.dataMode="DEMO";return [...(globalStore.localEnergyFlex!.get(context.organizationId)?.values()??[])];
}

export async function createLocalEnergyFlexibility(context:LocalEnergyRequestContext,input:{gridAreaId:string;direction:"INCREASE_EXPORT"|"REDUCE_EXPORT"|"INCREASE_IMPORT"|"REDUCE_IMPORT";requestedWh:bigint;availableWh:bigint;startsAt:Date;endsAt:Date;idempotencyKey:string}){
  if(localEnergyDatabaseConfigured()){
    context.dataMode="LIVE";
    const data=await globalStore.localEnergyRepository!.createFlexibility({id:`flex_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,...input});
    await globalStore.localEnergyRepository!.writeAudit({organizationId:context.organizationId,actorId:context.userId,action:"local-energy.flexibility.created",resource:"local-energy-flexibility",resourceId:data.id,requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode,metadata:{gridAreaId:input.gridAreaId,direction:input.direction,requestedWh:input.requestedWh.toString()}});
    return data;
  }
  context.dataMode="DEMO";
  if(input.requestedWh<=0n||input.requestedWh>input.availableWh)throw Object.assign(new Error("Flexibility request exceeds available physical capacity"),{code:"LOCAL_ENERGY_FLEXIBILITY_NOT_BACKED"});
  let store=globalStore.localEnergyFlex!.get(context.organizationId);if(!store){store=new Map();globalStore.localEnergyFlex!.set(context.organizationId,store)}
  const existing=[...store.values()].find(item=>item.idempotencyKey===input.idempotencyKey);
  if(existing){
    const replay=existing as{gridAreaId:string;direction:string;requestedWh:bigint;availableWh:bigint;startsAt:Date;endsAt:Date};
    const same=replay.gridAreaId===input.gridAreaId&&replay.direction===input.direction&&replay.requestedWh===input.requestedWh&&replay.availableWh===input.availableWh&&new Date(replay.startsAt).getTime()===input.startsAt.getTime()&&new Date(replay.endsAt).getTime()===input.endsAt.getTime();
    if(!same)throw Object.assign(new Error("Idempotency key was reused with a different flexibility payload"),{code:"LOCAL_ENERGY_IDEMPOTENCY_CONFLICT"});
    return existing;
  }
  const now=new Date();const data={id:`flex_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,...input,state:"OPEN",createdAt:now,updatedAt:now};
  store.set(data.id,data);return data;
}

export async function getLocalEnergyOverview(context:LocalEnergyRequestContext){
  const listings=await listLocalEnergyListings(context);
  const orders=await listLocalEnergyOrders(context);
  const flex=await listLocalEnergyFlexibility(context);
  const activeOrders=orders.filter(order=>!["SETTLED","CANCELLED"].includes(order.state)).length;
  const deliveredWh=orders.reduce((sum,order)=>sum+order.deliveredWh,0n);
  const demo=!localEnergyDatabaseConfigured();
  const livePrice=listings.length
    ? listings.reduce((sum,item)=>sum+Number(item.priceMicrosPerKwh)/1_000_000,0)/listings.length
    : null;
  return{
    version:"1.0.0",canonicalUnit:"Wh",
    community:demo?{
      dataState:"DEMO" as const,
      source:"DEMO_CATALOG",
      members:energyCommunitySummary.members,producers:energyCommunitySummary.producers,consumers:energyCommunitySummary.consumers,batteries:energyCommunitySummary.batteries,
      localSupplyWh:kwhToWh(energyCommunitySummary.localSupplyKwh),localDemandWh:kwhToWh(energyCommunitySummary.localDemandKwh),
      matchedPercent:energyCommunitySummary.matchedPercent,averagePrice:energyCommunitySummary.averagePrice,carbonAvoidedKg:energyCommunitySummary.carbonAvoidedKg,
    }:{
      dataState:"UNAVAILABLE" as const,
      source:"NO_LIVE_COMMUNITY_AGGREGATE_SOURCE",
      members:null,producers:null,consumers:null,batteries:null,
      localSupplyWh:null,localDemandWh:null,matchedPercent:null,averagePrice:livePrice,carbonAvoidedKg:null,
    },
    market:{activeListings:listings.length,activeOrders,deliveredWh,openFlexibilitySignals:flex.filter(item=>(item as{state?:string}).state==="OPEN").length},
    status:{
      telemetry:demo?"OPERATIONAL":"UNAVAILABLE",
      market:"OPERATIONAL",
      grid:demo?"OPERATIONAL":"DEGRADED",
      settlement:"OPERATIONAL",
      solana:demo?"OPERATIONAL":"UNAVAILABLE",
      sui:demo?"OPERATIONAL":"UNAVAILABLE",
    },
    principles:{physicalEnergyAuthoritative:true,blockchainSettlementDoesNotProveDelivery:true,batteryDischargeCreatesNoNewRenewableProvenance:true,tokenizationOptional:true},
  };
}
