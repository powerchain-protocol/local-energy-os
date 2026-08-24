export type ServiceStatus = "operational" | "degraded" | "offline" | "unknown";
export interface PlatformStatus { service:string; status:ServiceStatus; latencyMs?:number; checkedAt:string; detail?:string; }
export const statusPriority:Record<ServiceStatus,number>={offline:0,degraded:1,unknown:2,operational:3};
export function aggregateStatus(items:PlatformStatus[]):ServiceStatus {
  if(!items.length)return "unknown";
  return [...items].sort((a,b)=>statusPriority[a.status]-statusPriority[b.status])[0].status;
}
