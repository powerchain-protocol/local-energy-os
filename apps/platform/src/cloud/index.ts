/** Public entry point for the PowerChain cloud layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const cloudLayer = {
  id: "cloud",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
