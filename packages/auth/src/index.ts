import { createHash, createPublicKey, randomBytes, verify } from "node:crypto";

export const SOLANA_CHALLENGE_TTL_MS = 3 * 60 * 1000;
export const SESSION_TTL_MS = 27 * 24 * 60 * 60 * 1000;

export interface SolanaChallenge { wallet: string; nonce: string; origin: string; cluster: string; issuedAt: string; expiresAt: string; consumedAt?: string }

export function createSolanaChallenge(input: { wallet: string; origin: string; cluster: string; now?: Date }) {
  const now = input.now ?? new Date();
  const expires = new Date(now.getTime() + SOLANA_CHALLENGE_TTL_MS);
  const challenge: SolanaChallenge = { ...input, nonce: randomBytes(24).toString("hex"), issuedAt: now.toISOString(), expiresAt: expires.toISOString() };
  return { challenge, message: `PowerChain Authentication\n\nSign this message to authenticate with PowerChain.\n\nWallet: ${input.wallet}\nOrigin: ${input.origin}\nNetwork: ${input.cluster}\nNonce: ${challenge.nonce}\nIssued At: ${challenge.issuedAt}\nExpires At: ${challenge.expiresAt}\n\nThis request does not create a blockchain transaction, approve any transaction, transfer funds, or authorize PowerChain to move assets.` };
}

export function assertChallengeUsable(c: SolanaChallenge, now = new Date()) {
  if (c.consumedAt) throw Object.assign(new Error("Challenge has already been consumed"), { code: "CHALLENGE_CONSUMED", status: 409 });
  if (new Date(c.expiresAt) <= now) throw Object.assign(new Error("Challenge has expired"), { code: "CHALLENGE_EXPIRED", status: 410 });
}

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function decodeBase58(value: string): Uint8Array {
  if (!value) throw new Error("BASE58_EMPTY");
  const bytes = [0];
  for (const char of value) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) throw new Error("BASE58_INVALID");
    let carry = digit;
    for (let i = 0; i < bytes.length; i++) {
      const x = bytes[i] * 58 + carry;
      bytes[i] = x & 0xff;
      carry = x >> 8;
    }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (let i = 0; i < value.length - 1 && value[i] === "1"; i++) bytes.push(0);
  return Uint8Array.from(bytes.reverse());
}

export function verifySolanaMessageSignature(input: { wallet: string; message: string; signature: string }): boolean {
  const publicKey = decodeBase58(input.wallet);
  const signature = decodeBase58(input.signature);
  if (publicKey.length !== 32 || signature.length !== 64) return false;
  const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const key = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(publicKey)]), format: "der", type: "spki" });
  return verify(null, Buffer.from(input.message, "utf8"), key, Buffer.from(signature));
}

export function newSessionToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + SESSION_TTL_MS) };
}

export function hashSessionToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
