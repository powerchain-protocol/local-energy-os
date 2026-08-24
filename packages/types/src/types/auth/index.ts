export type AppRole = "consumer" | "prosumer" | "company" | "admin" | "super-admin" | "client";
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  walletAddress?: string;
  tier?: "starter" | "prosumer" | "business" | "enterprise";
};
export type Session = { id: string; user: AuthUser; issuedAt: string; expiresAt: string };
