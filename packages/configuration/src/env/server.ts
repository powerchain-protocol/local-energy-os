import "server-only";
import { serverEnvironmentSchema } from "./schema";

/** Server-only environment values, including credentials and private RPC URLs. */
export const serverEnv = serverEnvironmentSchema.parse(process.env);
