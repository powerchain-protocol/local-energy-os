export type IntelligenceInputKind="meter"|"weather"|"market"|"grid"|"asset";
export type IntelligenceModelKind="production_forecast"|"demand_prediction"|"battery_optimization"|"predictive_maintenance"|"dynamic_pricing"|"energy_trading";
export type OptimizationActionKind="grid_balancing"|"asset_control"|"trading_decision"|"carbon_optimization";
export interface IntelligenceSignal{id:string;kind:IntelligenceInputKind;sourceId:string;value:number;unit:string;quality:number;observedAt:string}
export interface ModelPrediction{id:string;model:IntelligenceModelKind;horizon:string;value:number;unit:string;confidence:number;createdAt:string;drivers:string[]}
export interface OptimizationAction{id:string;kind:OptimizationActionKind;title:string;description:string;priority:"low"|"medium"|"high"|"critical";expectedImpact:string;confidence:number;requiresApproval:boolean;status:"recommended"|"approved"|"executing"|"completed"}
