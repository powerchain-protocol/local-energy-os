export type PartnershipStatus = "prospect" | "active" | "paused" | "ended";
export interface Partnership { id: string; slug: string; organizationId: string; partnerName: string; category: "utility" | "technology" | "finance" | "government" | "research"; status: PartnershipStatus; ownerId: string; }
