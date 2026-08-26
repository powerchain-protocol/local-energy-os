# Authentication

PowerChain separates **account/session authentication**, **wallet ownership verification**, **organization authorization**, and **transaction/dispatch approval**. UI must never imply that signing in grants authority to move assets or change physical energy state.

## Authentication surfaces

The Platform app provides standalone account UX at:

```text
/sign-in
/sign-up
/forgot-password
/reset-password
```

These routes intentionally do not render the authenticated application sidebar. On desktop they use a split trust/auth layout; on mobile the trust narrative collapses into a compact PowerChain header and single-column form.

The password UI is currently **contract-ready but fail-closed**: the repository does not yet implement a credential-provider API, so password submissions display an explicit provider-not-configured state and do not store or transmit credentials. Solana message authentication remains the implemented authentication backend.

## Account states

Canonical account UI states are:

```text
SIGNED_OUT
AUTHENTICATING
AUTHENTICATED
EMAIL_VERIFICATION_REQUIRED
PASSWORD_RESET_REQUIRED
SESSION_EXPIRED
SUSPENDED
UNAVAILABLE
```

Do not collapse these into a generic “login failed” message. The user should know whether the problem is credentials, verification, session lifetime, suspension, or service availability.

## Password policy

The shared client-safe policy is exported from `@powerchain/auth/password-policy`.

A password must:

- be 12–128 characters;
- contain lowercase and uppercase letters;
- contain at least one number;
- contain at least one symbol;
- have no leading or trailing whitespace;
- not contain the email local-part when that part is meaningful;
- not match the small explicit common/PowerChain-branded denylist.

The UI shows every rule while the user types and provides a separate strength indicator. Strength never overrides a failed rule.

## Loading and errors

Authentication UI uses:

- route-level skeleton loading;
- in-button pending state with `aria-busy`;
- `aria-live` feedback for success/information;
- `role="alert"` for actionable validation/authentication errors;
- inline password mismatch feedback;
- disabled pending submit controls;
- reduced-motion handling.

Generic reset requests must not reveal whether an email address is registered.

## Solana sign-in

```text
POST /api/v1/auth/solana/challenge
  ↓ persist exact message + nonce + expiry
Wallet signs exact message
  ↓
POST /api/v1/auth/solana/verify
  ↓ Ed25519 verification
Atomic challenge consumption
  ↓
LinkedWallet / User
  ↓
Hashed Session record
  ↓
HttpOnly powerchain_session cookie
```

Challenges expire after three minutes. Only one live challenge is retained per wallet. Verification uses the exact stored message and atomically consumes the challenge to prevent replay.

The authentication signature explicitly does not create a transaction, approve a transaction, transfer assets, or authorize PowerChain to move funds.

## Sessions

Opaque session tokens are stored only as SHA-256 hashes. The browser receives the raw token in an HttpOnly, SameSite=Lax cookie. Production cookies use `Secure`. Unsafe cookie-authenticated requests must provide an Origin included in `AUTH_TRUSTED_ORIGINS`.

Wallet authentication proves wallet ownership. Organization roles come from `OrganizationMembership`; a wallet-authenticated user without a membership does not receive tenant write authority.

## Development identity headers

`x-powerchain-user-id` and `x-powerchain-role` are accepted only when `POWERCHAIN_TRUST_DEV_HEADERS=true` and the runtime environment is not production. Production ignores these headers and fails closed to session identity.
