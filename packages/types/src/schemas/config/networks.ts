import { z } from "zod";

export const solanaClusterSchema = z.enum(["devnet", "mainnet-beta"]);
export const suiNetworkSchema = z.enum(["devnet", "testnet", "mainnet"]);
export const rpcUrlSchema = z.string().url().refine((url) => url.startsWith("https://"), "RPC URL must use HTTPS");
