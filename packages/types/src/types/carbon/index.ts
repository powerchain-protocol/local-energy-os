export type CarbonCreditStatus="draft"|"pending_verification"|"verified"|"issued"|"listed"|"reserved"|"sold"|"transferred"|"retired"|"cancelled";
export type CarbonProjectType="solar"|"wind"|"hydro"|"battery"|"microgrid"|"ev_charging"|"efficiency"|"reforestation"|"blue_carbon";
export interface CarbonProject{ id:string; name:string; type:CarbonProjectType; country:string; standard:string; verifiedTonnes:number; status:"operational"|"verification"|"development"; owner:string; }
export interface CarbonCredit{ id:string; projectId:string; vintage:number; tonnes:number; price:number; currency:"EUR"|"USD"|"USDC"; status:CarbonCreditStatus; blockchainHash?:string; }
export interface CarbonDashboard{ creditsIssued:number; creditsTraded:number; creditsRetired:number; co2Reduced:number; esgScore:number; portfolioValue:number; }
