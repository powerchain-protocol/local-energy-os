import type { PublicWalletIdentity, WalletChain, WalletIdentityRegistry } from "@powerchain/adapters";
import type { PrismaClient } from "../generated/prisma/client.js";
export class PrismaWalletIdentityRegistry implements WalletIdentityRegistry {
  constructor(private readonly prisma: PrismaClient) {}
  async list(actorId: string, organizationId: string): Promise<PublicWalletIdentity[]> {
    const rows = await this.prisma.publicWalletIdentity.findMany({ where: { actorId, organizationId }, orderBy: [{ isPrimary: "desc" }, { verifiedAt: "asc" }] });
    return rows.map(row => ({ ...row, chain: row.chain as WalletChain, label: row.label ?? undefined, verifiedAt: row.verifiedAt.toISOString() }));
  }
  async find(chain: WalletChain, address: string): Promise<PublicWalletIdentity | null> {
    const row = await this.prisma.publicWalletIdentity.findUnique({ where: { chain_address: { chain, address } } });
    return row ? { ...row, chain: row.chain as WalletChain, label: row.label ?? undefined, verifiedAt: row.verifiedAt.toISOString() } : null;
  }
  async register(identity: PublicWalletIdentity): Promise<PublicWalletIdentity> {
    const row = await this.prisma.publicWalletIdentity.upsert({ where: { chain_address: { chain: identity.chain, address: identity.address } }, create: { id: identity.id, actorId: identity.actorId, organizationId: identity.organizationId, chain: identity.chain, address: identity.address, label: identity.label, isPrimary: identity.isPrimary, verifiedAt: new Date(identity.verifiedAt) }, update: { actorId: identity.actorId, organizationId: identity.organizationId, label: identity.label, isPrimary: identity.isPrimary, verifiedAt: new Date(identity.verifiedAt) } });
    return { ...row, chain: row.chain as WalletChain, label: row.label ?? undefined, verifiedAt: row.verifiedAt.toISOString() };
  }
}
