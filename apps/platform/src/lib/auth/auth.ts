import type { AppRole, AuthUser } from "@/types/auth";
import { emailSchema, passwordSchema } from "@/types/validate";

export type Credentials = { email: string; password: string };
export const DEMO_ACCOUNTS: Record<AppRole, Credentials & { name: string }> = {
  consumer: { email: "consumer@demo.powerchain.energy", password: "DemoPower123!", name: "Demo Consumer" },
  prosumer: { email: "prosumer@demo.powerchain.energy", password: "DemoPower123!", name: "Demo Prosumer" },
  client: { email: "client@demo.powerchain.energy", password: "DemoPower123!", name: "P2P Trading Client" },
  company: { email: "company@demo.powerchain.energy", password: "DemoPower123!", name: "PowerChain Energy Ltd" },
  admin: { email: "admin@demo.powerchain.energy", password: "DemoPower123!", name: "Organization Admin" },
  "super-admin": { email: "superadmin@demo.powerchain.energy", password: "DemoPower123!", name: "Platform Super Admin" }
};
export function validateCredentials(input: Credentials): Credentials { return { email: emailSchema.parse(input.email), password: passwordSchema.parse(input.password) }; }
function roleFromEmail(email: string): AppRole {
  const entry = Object.entries(DEMO_ACCOUNTS).find(([, account]) => account.email === email);
  if (entry) return entry[0] as AppRole;
  if (email.startsWith("superadmin")) return "super-admin";
  if (email.startsWith("admin")) return "admin";
  if (email.startsWith("company")) return "company";
  if (email.startsWith("client")) return "client";
  if (email.startsWith("consumer")) return "consumer";
  return "prosumer";
}
export async function authenticate(credentials: Credentials): Promise<AuthUser> {
  const { email } = validateCredentials(credentials);
  const role = roleFromEmail(email);
  const demo = DEMO_ACCOUNTS[role];
  return {
    id: `usr_${Buffer.from(email).toString("base64url").slice(0, 12)}`,
    email,
    name: demo?.email === email ? demo.name : email.split("@")[0].replace(/[._-]/g, " "),
    role,
    organizationId: role === "consumer" ? "org_personal_demo" : "org_powerchain_demo",
    organizationName: role === "consumer" ? "Personal Energy Home" : "PowerChain Demo Grid",
    tier: role === "super-admin" || role === "admin" ? "enterprise" : role === "company" ? "business" : role === "prosumer" ? "prosumer" : "starter",
    walletAddress: "7YvU4u2hYqf4P3cbP6fR2vV3wwYjV46Z1h4eUjYwT1aQ"
  };
}
