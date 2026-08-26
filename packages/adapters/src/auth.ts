export type AuthMethod = "PASSWORD" | "OAUTH" | "SOLANA_MESSAGE" | "SUI_PERSONAL_MESSAGE" | "EMBEDDED_WALLET";
export interface AuthIdentity { subject: string; organizationIds: string[]; email?: string; displayName?: string; methods: AuthMethod[]; }
export interface AuthSession { id: string; identity: AuthIdentity; issuedAt: string; expiresAt: string; }
export interface AuthAdapter {
  readonly id: string;
  getSession(input: { headers?: Headers; cookie?: string }): Promise<AuthSession | null>;
  signOut?(sessionId: string): Promise<void>;
}

/** Server-side operational identity. It carries authorization context, never signing material. */
export interface OperationsIdentity {
  actorId: string;
  organizationId: string;
  provider: string;
  email?: string;
  roles: string[];
  sessionId?: string;
}

export interface OperationsAuthInput {
  authorization?: string;
  headers: Readonly<Record<string, string | undefined>>;
}

/** Provider-neutral adapter used by the isolated operations backend. */
export interface OperationsAuthAdapter {
  readonly id: string;
  authenticate(input: OperationsAuthInput): Promise<OperationsIdentity | null>;
}
