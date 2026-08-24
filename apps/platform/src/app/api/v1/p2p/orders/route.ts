import { z } from "zod";
import { kwhToWh } from "@powerchain/local-energy";
import { isSolanaAddress } from "@/types/validate";
import {
  createLocalEnergyOrder,
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  listLocalEnergyOrders,
  localEnergyError,
  localEnergyResponse,
  publicLocalEnergyOrder,
  requireLocalEnergyIdempotencyKey,
} from "@/lib/local-energy/server";

const schema=z.object({
  listingId:z.string().min(3).max(200),
  buyerId:z.string().min(2).max(200).optional(),
  quantityKwh:z.number().positive().max(1_000_000),
  toleranceKwh:z.number().nonnegative().max(100_000).optional(),
  walletAddress:z.string().optional(),
});

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    const orders=await listLocalEnergyOrders(context);
    return localEnergyResponse(orders.map(publicLocalEnergyOrder),context);
  }catch(error){
    return localEnergyError(error,context);
  }
}

export async function POST(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context,true);
    const idempotencyKey=requireLocalEnergyIdempotencyKey(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)throw Object.assign(new Error("Invalid Local Energy order"),{code:"LOCAL_ENERGY_ORDER_INPUT_INVALID"});
    const data=parsed.data;
    if(data.walletAddress&&!isSolanaAddress(data.walletAddress)){
      throw Object.assign(new Error("A valid Solana wallet address is required when walletAddress is provided"),{code:"LOCAL_ENERGY_WALLET_ADDRESS_INVALID"});
    }
    const created=await createLocalEnergyOrder(context,{
      listingId:data.listingId,
      quantityWh:kwhToWh(data.quantityKwh),
      idempotencyKey,
      ...(data.toleranceKwh!==undefined?{toleranceWh:kwhToWh(data.toleranceKwh)}:{}),
    });
    return localEnergyResponse({order:publicLocalEnergyOrder(created)},context,{status:201});
  }catch(error){
    return localEnergyError(error,context);
  }
}
