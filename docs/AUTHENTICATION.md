# Authentication

PowerChain separates account/session authentication, wallet ownership verification, and blockchain transaction authorization.

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
