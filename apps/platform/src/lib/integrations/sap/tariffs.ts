import type { EnergyTariff } from "@/types/certification";
import { PowerChainError } from "@/utils/errors";
export interface SapTariffAdapterConfig { baseUrl:string; credentialId:string; timeoutMs?:number; }
export class SapTariffAdapter { constructor(private readonly config:SapTariffAdapterConfig){}
 async fetchTariffs(region:string):Promise<EnergyTariff[]>{
  if(!/^https:\/\//.test(this.config.baseUrl)) throw new PowerChainError("SAP base URL must use HTTPS","VALIDATION_ERROR",400);
  const token=process.env.SAP_ACCESS_TOKEN; if(!token) return [{id:`sap-${region}`,region,countryCode:region.slice(0,2).toUpperCase(),currency:"EUR",unit:"MWh",price:"0",market:"retail",source:"SAP",observedAt:new Date().toISOString(),state:"misconfigured" as never}];
  const controller=new AbortController(); const t=setTimeout(()=>controller.abort(),this.config.timeoutMs??8000);
  try{const r=await fetch(`${this.config.baseUrl}/tariffs?region=${encodeURIComponent(region)}`,{headers:{Authorization:`Bearer ${token}`,"X-Credential-Reference":this.config.credentialId},signal:controller.signal,cache:"no-store"}); if(!r.ok) throw new PowerChainError("SAP tariff provider unavailable","PROVIDER_ERROR",503); const body=await r.json() as {value?:EnergyTariff[]}; return Array.isArray(body.value)?body.value:[];} finally{clearTimeout(t);}
 }
}
