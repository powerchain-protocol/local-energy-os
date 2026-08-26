export type AccountState =
  | "SIGNED_OUT"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "EMAIL_VERIFICATION_REQUIRED"
  | "PASSWORD_RESET_REQUIRED"
  | "SESSION_EXPIRED"
  | "SUSPENDED"
  | "UNAVAILABLE";

export const ACCOUNT_STATE_COPY: Record<AccountState, { label: string; description: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  SIGNED_OUT: { label: "Signed out", description: "No authenticated PowerChain session is active in this browser.", tone: "neutral" },
  AUTHENTICATING: { label: "Authenticating", description: "PowerChain is validating your identity and creating a bounded session.", tone: "info" },
  AUTHENTICATED: { label: "Session active", description: "Identity is authenticated. Organization access is resolved separately from membership and policy.", tone: "success" },
  EMAIL_VERIFICATION_REQUIRED: { label: "Verify email", description: "The account exists, but email verification is required before credential access can be trusted.", tone: "warning" },
  PASSWORD_RESET_REQUIRED: { label: "Password reset required", description: "Credential access is paused until a new password satisfying the current policy is set.", tone: "warning" },
  SESSION_EXPIRED: { label: "Session expired", description: "The previous session is no longer valid. Sign in again to continue.", tone: "warning" },
  SUSPENDED: { label: "Account suspended", description: "Authentication is blocked. Contact an organization or platform administrator.", tone: "danger" },
  UNAVAILABLE: { label: "Authentication unavailable", description: "The authentication service cannot currently confirm account state.", tone: "danger" },
};
