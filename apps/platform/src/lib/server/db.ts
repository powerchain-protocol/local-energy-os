type WalletSession = { address: string; connectedAt: string; network: string };
const walletSessions = new Map<string, WalletSession>();

export const db = {
  walletSession: {
    async upsert(session: WalletSession) {
      walletSessions.set(session.address, session);
      return session;
    },
    async find(address: string) {
      return walletSessions.get(address) ?? null;
    },
  },
  async health() {
    return { ok: true, adapter: process.env.DATABASE_URL ? "configured" : "memory" };
  },
};
