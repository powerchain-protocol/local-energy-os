import { z } from "zod";
import { kwhToWh } from "@powerchain/local-energy";
import {
  createLocalEnergyFlexibility,
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  listLocalEnergyFlexibility,
  localEnergyError,
  localEnergyResponse,
  requireLocalEnergyIdempotencyKey,
} from "@/lib/local-energy/server";

const schema=z.object({
  gridAreaId:z.string().min(2).max(160),
  direction:z.enum(["INCREASE_EXPORT","REDUCE_EXPORT","INCREASE_IMPORT","REDUCE_IMPORT"]),
  requestedKwh:z.number().positive().max(1_000_000),
  availableKwh:z.number().nonnegative().max(1_000_000),
  startsAt:z.string().datetime(),
  endsAt:z.string().datetime(),
});

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    return localEnergyResponse(await listLocalEnergyFlexibility(context),context);
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
    if(!parsed.success)throw Object.assign(new Error("Invalid Local Energy flexibility request"),{code:"LOCAL_ENERGY_FLEXIBILITY_INPUT_INVALID"});
    const data=parsed.data;
    const created=await createLocalEnergyFlexibility(context,{
      gridAreaId:data.gridAreaId,
      direction:data.direction,
      requestedWh:kwhToWh(data.requestedKwh),
      availableWh:kwhToWh(data.availableKwh),
      startsAt:new Date(data.startsAt),
      endsAt:new Date(data.endsAt),
      idempotencyKey,
    });
    return localEnergyResponse(created,context,{status:201});
  }catch(error){
    return localEnergyError(error,context);
  }
}
