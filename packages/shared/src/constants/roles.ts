import type { AppRole } from "@/types/auth";
export type UserRole = AppRole;
export const ROLES: ReadonlyArray<{id:AppRole;label:string;description:string}> = [
 {id:"consumer",label:"Consumer",description:"Track consumption, bills and clean-energy purchases."},
 {id:"prosumer",label:"Prosumer",description:"Operate generation assets and sell surplus energy."},
 {id:"client",label:"P2P Client",description:"Trade tokenized energy and environmental assets."},
 {id:"company",label:"Company",description:"Manage portfolios, teams, treasury and operations."},
 {id:"admin",label:"Administrator",description:"Administer organizations, policies and integrations."},
 {id:"super-admin",label:"Super Administrator",description:"Operate the full platform and tenant control plane."}
];
export const DEFAULT_ROLE: AppRole = "consumer";
