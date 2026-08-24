import type { DashboardRole } from "@/lib/workspaces/dashboard/roles";
export type RoleDashboard = { title:string; subtitle:string; highlights:string[]; primaryAction:string };
export const roleDashboards: Record<DashboardRole,RoleDashboard> = {
 consumer:{title:"My Energy",subtitle:"Track usage, costs and clean-energy impact.",highlights:["Consumption","Billing","Carbon savings"],primaryAction:"Explore plans"},
 prosumer:{title:"Prosumer Hub",subtitle:"Generate, consume and trade local renewable energy.",highlights:["Generation","Battery","P2P sales"],primaryAction:"Sell energy"},
 company:{title:"Company Operations",subtitle:"Manage sites, teams, contracts and treasury.",highlights:["Portfolio","ERP","Treasury"],primaryAction:"Add asset"},
 admin:{title:"Organization Admin",subtitle:"Control members, roles, policy and audit history.",highlights:["Members","Access","Audit"],primaryAction:"Invite member"},
 super_admin:{title:"Platform Control",subtitle:"Operate tenants, infrastructure and governance.",highlights:["Tenants","System health","Governance"],primaryAction:"Open control plane"},
 client:{title:"P2P Energy Trading",subtitle:"Discover verified energy offers and settle on-chain.",highlights:["Markets","Orders","Settlement"],primaryAction:"Open marketplace"}
};
