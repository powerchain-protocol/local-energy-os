export type DashboardRole = "consumer" | "prosumer" | "company" | "admin" | "super_admin" | "client";
export const roleLabels: Record<DashboardRole,string> = {
 consumer:"Consumer", prosumer:"Prosumer", company:"Company", admin:"Admin", super_admin:"Super Admin", client:"P2P Trading Client"
};
export const roleHome: Record<DashboardRole,string> = {
 consumer:"/", prosumer:"/energy", company:"/portfolio", admin:"/settings/organization", super_admin:"/settings", client:"/marketplace"
};
export const roleCapabilities: Record<DashboardRole,string[]> = {
 consumer:["energy.read","billing.read","marketplace.buy"],
 prosumer:["energy.read","energy.sell","assets.manage","marketplace.trade"],
 company:["portfolio.manage","team.manage","treasury.manage","projects.create"],
 admin:["organization.manage","members.manage","audit.read"],
 super_admin:["platform.manage","tenants.manage","roles.manage"],
 client:["marketplace.trade","wallet.connect","orders.manage"]
};
