/** Public entry point for the PowerChain runtime layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const runtimeLayer = {
  id: "runtime",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
