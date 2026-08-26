export type WalletChain = "solana" | "sui";
export interface WalletAccount { chain: WalletChain; address: string; label?: string; embedded?: boolean; }
export interface WalletSignature { signature: string; publicKey: string; message: string; }
export interface WalletAdapter {
  readonly id: string;
  readonly chain: WalletChain;
  connect(): Promise<WalletAccount[]>;
  disconnect(): Promise<void>;
  accounts(): Promise<WalletAccount[]>;
  signMessage(account: WalletAccount, message: Uint8Array): Promise<WalletSignature>;
  signTransaction?(account: WalletAccount, serializedTransaction: Uint8Array): Promise<Uint8Array>;
}

/** Public wallet identity only. Private keys, seed phrases and signing secrets are forbidden here. */
export interface PublicWalletIdentity {
  id: string;
  actorId: string;
  organizationId: string;
  chain: WalletChain;
  address: string;
  label?: string;
  isPrimary: boolean;
  verifiedAt: string;
}

export interface WalletIdentityRegistry {
  list(actorId: string, organizationId: string): Promise<PublicWalletIdentity[]>;
  find(chain: WalletChain, address: string): Promise<PublicWalletIdentity | null>;
  register(identity: PublicWalletIdentity): Promise<PublicWalletIdentity>;
}
