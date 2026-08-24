import { z } from "zod";

export const SOLANA_BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;
export const publicKeySchema = z.string().trim().min(32).max(44).regex(SOLANA_BASE58_PATTERN, "Invalid Solana base58 public key");
export const signatureSchema = z.string().trim().min(64).max(128).regex(SOLANA_BASE58_PATTERN, "Invalid Solana signature");
export const slugSchema = z.string().trim().min(2).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const amountSchema = z.coerce.number().finite().positive("Amount must be greater than zero").max(1_000_000_000);
export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const passwordSchema = z.string().min(10).max(128).regex(/[A-Z]/, "Add an uppercase letter").regex(/[a-z]/, "Add a lowercase letter").regex(/[0-9]/, "Add a number");

export function isSolanaAddress(value: string): boolean {
  return publicKeySchema.safeParse(value).success;
}

export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}
