/** Public entry point for the PowerChain developer layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const developerLayer = {
  id: "developer",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
