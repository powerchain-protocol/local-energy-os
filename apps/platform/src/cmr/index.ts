export type CustomerRecord = { id:string; organizationId:string; slug:string; name:string; status:"lead"|"active"|"inactive"; ownerId:string };
export const cmrStages = ["lead","qualified","proposal","contract","active"] as const;
