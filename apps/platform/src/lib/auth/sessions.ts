import type { AuthUser, Session } from "@/types/auth";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, randomToken } from "@/lib/security/security";

const sessions = new Map<string, Session>();

export function createSession(user: AuthUser): Session {
  const id = randomToken();
  const issuedAt = new Date();
  const session: Session = { id, user, issuedAt: issuedAt.toISOString(), expiresAt: new Date(issuedAt.getTime() + SESSION_TTL_SECONDS * 1000).toISOString() };
  sessions.set(id, session);
  return session;
}
export function getSession(id?: string | null): Session | null {
  if (!id) return null;
  const session = sessions.get(id);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) { sessions.delete(id); return null; }
  return session;
}
export function destroySession(id?: string | null): void { if (id) sessions.delete(id); }
export function sessionCookie(id: string): string { return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`; }
export function expiredSessionCookie(): string { return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`; }
