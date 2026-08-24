/** Public entry point for the PowerChain foundation layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const foundationLayer = {
  id: "foundation",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
