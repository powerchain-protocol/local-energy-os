/** Public entry point for the PowerChain shared layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const sharedLayer = {
  id: "shared",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
