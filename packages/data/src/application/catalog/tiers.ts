export type TierId = "starter" | "prosumer" | "business" | "enterprise";
export type Tier = { id: TierId; name: string; monthlyUsd: number; features: string[]; limits: { users: number; assets: number; apiCalls: number } };
export const tiers: Tier[] = [
 {id:"starter",name:"Starter",monthlyUsd:0,features:["Consumption dashboard","Wallet","Marketplace"],limits:{users:1,assets:2,apiCalls:10000}},
 {id:"prosumer",name:"Prosumer",monthlyUsd:29,features:["Generation analytics","P2P trading","Smart meters"],limits:{users:3,assets:20,apiCalls:100000}},
 {id:"business",name:"Business",monthlyUsd:199,features:["Digital twins","AI forecasting","ERP integrations"],limits:{users:25,assets:250,apiCalls:1000000}},
 {id:"enterprise",name:"Enterprise",monthlyUsd:0,features:["Unlimited tenants","SCADA/IoT","Custom SLA"],limits:{users:-1,assets:-1,apiCalls:-1}}
];
export function getTier(id: TierId){return tiers.find(t=>t.id===id) ?? tiers[0];}
