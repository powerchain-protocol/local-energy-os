import { createHash } from "node:crypto";
import { z } from "zod";
import { kwhToWh } from "@powerchain/local-energy";
import { PostgresLocalEnergyRepository } from "@powerchain/database/local-energy";
import {
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  listLocalEnergyListings,
  localEnergyDatabaseConfigured,
  localEnergyError,
  localEnergyResponse,
  publicLocalEnergyListing,
  requireLocalEnergyIdempotencyKey,
} from "@/lib/local-energy/server";

const repository=new PostgresLocalEnergyRepository();
const schema=z.object({
  sellerOrganizationId:z.string().min(2).max(160).optional(),
  sellerName:z.string().min(2).max(160),
  title:z.string().min(3).max(200),
  mode:z.enum(["BUY","SELL","RENT"]),
  source:z.enum(["SOLAR","WIND","HYDRO","BATTERY","MIXED"]),
  gridAreaId:z.string().min(2).max(160),
  location:z.string().min(2).max(200),
  latitude:z.number().min(-90).max(90).optional(),
  longitude:z.number().min(-180).max(180).optional(),
  quantityKwh:z.number().positive().max(1_000_000),
  minimumKwh:z.number().positive().max(1_000_000),
  exportLimitKwh:z.number().positive().max(1_000_000).optional(),
  pricePerKwh:z.number().nonnegative().max(100_000),
  currency:z.enum(["EUR","USD"]).default("EUR"),
  settlementAsset:z.enum(["USDC","EURC","FIAT_EUR","PWRC"]),
  renewablePercent:z.number().int().min(0).max(100),
  verified:z.boolean().default(false),
  meterVerified:z.boolean().default(false),
  deliveryStart:z.string().datetime(),
  deliveryEnd:z.string().datetime(),
});

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    const url=new URL(request.url);
    const mode=url.searchParams.get("mode")?.toUpperCase();
    const source=url.searchParams.get("source")?.toUpperCase();
    const listings=await listLocalEnergyListings(context,{
      ...(mode&&["BUY","SELL","RENT"].includes(mode)?{mode:mode as "BUY"|"SELL"|"RENT"}:{}),
      ...(source&&["SOLAR","WIND","HYDRO","BATTERY","MIXED"].includes(source)?{source:source as "SOLAR"|"WIND"|"HYDRO"|"BATTERY"|"MIXED"}:{}),
      ...(url.searchParams.get("gridAreaId")?{gridAreaId:url.searchParams.get("gridAreaId")!}:{}),
    });
    return localEnergyResponse(listings.map(publicLocalEnergyListing),context);
  }catch(error){
    return localEnergyError(error,context);
  }
}

export async function POST(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context,true);
    const idempotencyKey=requireLocalEnergyIdempotencyKey(request);
    if(!localEnergyDatabaseConfigured()){
      throw Object.assign(new Error("Creating persistent Local Energy listings requires DATABASE_URL"),{code:"LOCAL_ENERGY_DATABASE_REQUIRED"});
    }
    const parsed=schema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)throw Object.assign(new Error("Invalid Local Energy listing"),{code:"LOCAL_ENERGY_LISTING_INPUT_INVALID"});
    const data=parsed.data;
    const quantityWh=kwhToWh(data.quantityKwh);
    const minimumWh=kwhToWh(data.minimumKwh);
    const id=`lel_${createHash("sha256").update(`${context.organizationId}:${idempotencyKey}`).digest("hex").slice(0,28)}`;
    const created=await repository.createListing({
      id,
      organizationId:context.organizationId,
      sellerOrganizationId:data.sellerOrganizationId??context.organizationId,
      sellerName:data.sellerName,
      title:data.title,
      mode:data.mode,
      source:data.source,
      gridAreaId:data.gridAreaId,
      location:data.location,
      ...(data.latitude!==undefined?{latitude:data.latitude}:{}),
      ...(data.longitude!==undefined?{longitude:data.longitude}:{}),
      quantityWh,
      minimumWh,
      ...(data.exportLimitKwh!==undefined?{exportLimitWh:kwhToWh(data.exportLimitKwh)}:{}),
      priceMicrosPerKwh:BigInt(Math.round(data.pricePerKwh*1_000_000)),
      currency:data.currency,
      settlementAsset:data.settlementAsset,
      renewablePercent:data.renewablePercent,
      verified:data.verified,
      meterVerified:data.meterVerified,
      deliveryStart:new Date(data.deliveryStart),
      deliveryEnd:new Date(data.deliveryEnd),
      metadata:{createdBy:context.userId},
    });
    return localEnergyResponse(publicLocalEnergyListing(created),context,{status:201});
  }catch(error){
    return localEnergyError(error,context);
  }
}
