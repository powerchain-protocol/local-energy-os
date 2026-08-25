import { createHash } from "node:crypto";
import { createSolanaChallenge, newSessionToken, verifySolanaMessageSignature } from "@powerchain/auth";
import { getPrismaClient } from "@powerchain/database";

function trustedOrigins(): Set<string> {
  return new Set((process.env.AUTH_TRUSTED_ORIGINS ?? process.env.POWERCHAIN_ORIGIN ?? "http://localhost:3000").split(",").map(item => item.trim()).filter(Boolean));
}

export async function persistSolanaChallenge(input: { wallet: string; origin: string; cluster: string }) {
  if (!trustedOrigins().has(input.origin)) throw Object.assign(new Error("Authentication origin is not trusted"), { code: "UNTRUSTED_ORIGIN", status: 403 });
  if (!/^solana:(devnet|mainnet-beta)$/.test(input.cluster)) throw Object.assign(new Error("Unsupported Solana authentication cluster"), { code: "INVALID_CLUSTER", status: 422 });
  const created = createSolanaChallenge(input);
  const prisma = getPrismaClient();
  await prisma.$transaction(async tx => {
    await tx.walletAuthChallenge.updateMany({ where: { walletAddress: input.wallet, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
    await tx.walletAuthChallenge.create({ data: { walletAddress: input.wallet, nonce: created.challenge.nonce, origin: input.origin, cluster: input.cluster, message: created.message, expiresAt: new Date(created.challenge.expiresAt) } });
  });
  return { nonce: created.challenge.nonce, message: created.message, expiresAt: created.challenge.expiresAt, wallet: input.wallet, cluster: input.cluster };
}

export async function verifySolanaChallenge(input: { wallet: string; nonce: string; signature: string; userAgent?: string; ip?: string }) {
  const prisma = getPrismaClient();
  const challenge = await prisma.walletAuthChallenge.findUnique({ where: { nonce: input.nonce } });
  if (!challenge || challenge.walletAddress !== input.wallet) throw Object.assign(new Error("Authentication challenge not found"), { code: "CHALLENGE_NOT_FOUND", status: 404 });
  if (challenge.consumedAt) throw Object.assign(new Error("Authentication challenge already consumed"), { code: "CHALLENGE_CONSUMED", status: 409 });
  if (challenge.expiresAt <= new Date()) throw Object.assign(new Error("Authentication challenge expired"), { code: "CHALLENGE_EXPIRED", status: 410 });
  if (!verifySolanaMessageSignature({ wallet: input.wallet, message: challenge.message, signature: input.signature })) throw Object.assign(new Error("Invalid Solana message signature"), { code: "INVALID_WALLET_SIGNATURE", status: 401 });
  const sessionToken = newSessionToken();
  const result = await prisma.$transaction(async tx => {
    const consumed = await tx.walletAuthChallenge.updateMany({ where: { id: challenge.id, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
    if (consumed.count !== 1) throw Object.assign(new Error("Authentication challenge was consumed concurrently"), { code: "CHALLENGE_CONSUMED", status: 409 });
    let linked = await tx.linkedWallet.findUnique({ where: { network_address: { network: challenge.cluster, address: input.wallet } } });
    if (!linked) {
      const user = await tx.user.create({ data: {} });
      linked = await tx.linkedWallet.create({ data: { userId: user.id, network: challenge.cluster, address: input.wallet, isPrimary: true } });
    } else {
      await tx.linkedWallet.update({ where: { id: linked.id }, data: { lastUsedAt: new Date() } });
    }
    await tx.session.create({ data: { userId: linked.userId, tokenHash: sessionToken.tokenHash, expiresAt: sessionToken.expiresAt, userAgent: input.userAgent, ipHash: input.ip ? createHash("sha256").update(input.ip).digest("hex") : undefined } });
    return { userId: linked.userId, wallet: input.wallet, network: challenge.cluster, expiresAt: sessionToken.expiresAt };
  }, { isolationLevel: "Serializable" });
  return { ...result, token: sessionToken.token };
}
