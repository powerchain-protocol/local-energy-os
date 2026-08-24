import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { PowerChainError } from "@/utils/errors";
export type CetusNetwork = "mainnet" | "testnet";
export interface CetusOptions { network: CetusNetwork; wallet?: string; fullNodeUrl?: string; }
export function createCetusClient(options: CetusOptions) {
  if (options.fullNodeUrl && !options.fullNodeUrl.startsWith("https://")) throw new PowerChainError("Cetus full node URL must use HTTPS", "VALIDATION_ERROR", 400);
  const sdk = initCetusSDK({ network: options.network, wallet: options.wallet, fullNodeUrl: options.fullNodeUrl });
  if (options.wallet) sdk.senderAddress = options.wallet;
  return sdk;
}
export function assertCetusSwapReady(wallet: string | undefined, balance: bigint, amount: bigint): void {
  if (!wallet) throw new PowerChainError("Connect a Sui wallet before swapping", "AUTHENTICATION_REQUIRED", 401);
  if (amount <= 0n) throw new PowerChainError("Swap amount must be greater than zero", "VALIDATION_ERROR", 400);
  if (balance < amount) throw new PowerChainError("Insufficient wallet balance", "PAYMENT_ERROR", 422);
}
