import { localEnergyDatabaseConfigured } from "@/lib/local-energy/server";

export async function GET(){
  return Response.json({
    data:{
      status:"OPERATIONAL",
      service:"powerchain-local-energy",
      version:"1.0.0",
      canonicalUnit:"Wh",
      database:localEnergyDatabaseConfigured()?"CONFIGURED":"DEMO",
      principles:{
        physicalEnergyAuthoritative:true,
        settlementDoesNotProveDelivery:true,
      },
      observedAt:new Date().toISOString(),
    },
  },{headers:{"Cache-Control":"no-store"}});
}
